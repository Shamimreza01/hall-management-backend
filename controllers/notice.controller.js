import cloudinary from "../config/cloudinary.js";
import Notice from "../models/notice.model.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import noticeValidation from "../validations/notice.validation.js";

export const createNotice = async (req, res) => {
  try {
    const { error } = noticeValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation failed.",
        details: error.details.map((err) => err.message),
      });
    }

    if (!["Provost", "ViceProvost", "VC"].includes(req.user.role))
      return res
        .status(403)
        .json({ message: "Not authorized to create notices." });

    const { id } = req.user;

    let hall = req.hallId || null;
    if (req.body.visibility === "private" && !hall) {
      return res
        .status(400)
        .json({ message: "Hall ID is required for private notices." });
    }
    if (req.body.visibility === "public") {
      hall = null;
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await uploadBufferToCloudinary(
            file.buffer,
            "hall-management/notices"
          );
          return {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
          };
        })
      );
    }

    const newNotice = await Notice.create({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      visibility: req.body.visibility,
      hall,
      attachments,
      expiryDate: req.body.expiryDate || null,
      createdBy: id,
    });

    return res.status(201).json({
      message: "Notice created successfully.",
      notice: newNotice,
    });
  } catch (err) {
    console.error("Error creating notice:", err);
    return res.status(500).json({
      message: "Internal server error while creating notice.",
    });
  }
};
export const getNotices = async (req, res) => {
  try {
    const filter = { isActive: true, hall: req.hallId };
    if (req.hallId) filter.hall = req.hallId;

    const notices = await Notice.find(filter)
      .populate("createdBy", "name role")
      .populate("hall", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ notices });
  } catch (err) {
    console.error("Error retrieving notices:", err);
    return res.status(500).json({
      message: "Internal server error while retrieving notices.",
    });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) return res.status(404).json({ message: "Notice not found." });

    // Only creator or admin/VC can delete
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const { id } = req.user;
    if (notice.createdBy.toString() !== id && !["VC"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // 🗑 Delete attachments from Cloudinary
    if (notice.attachments && notice.attachments.length > 0) {
      await Promise.all(
        notice.attachments.map((att) => {
          if (att.public_id) {
            const resourceType = att.fileType.startsWith("image/")
              ? "image"
              : "raw";
            return cloudinary.uploader.destroy(att.public_id, {
              resource_type: resourceType,
            });
          }
        })
      );
    }
    await notice.deleteOne();

    return res
      .status(200)
      .json({ message: "Notice and attachments deleted successfully." });
  } catch (err) {
    console.error("Error deleting notice:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
