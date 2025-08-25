import Complaint from "../models/complaint.model.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import { complaintValidationSchema } from "../validations/complaint.validation.js";

export const createComplaint = async (req, res) => {
  try {
    const { error } = complaintValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { id } = req.user;
    const hall = req.hallId;
    if (!hall) {
      return res
        .status(403)
        .json({ message: "You are not assigned to any hall" });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      try {
        attachments = await Promise.all(
          req.files.map(async (file) => {
            const uploadResult = await uploadBufferToCloudinary(
              file.buffer,
              "hall-management/complaints"
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
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return res
          .status(500)
          .json({ message: "Failed to upload attachments" });
      }
    }

    const statusHistoryEntry = {
      previousStatus: null,
      newStatus: "pending",
      changedBy: id,
      note: "Complaint created",
    };

    const complaintData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category,
      priority: req.body.priority || 3,
      createdBy: id,
      hall: hall,
      attachments: attachments,
      status: "pending",
      statusHistory: [statusHistoryEntry],
    };

    const newComplaint = await Complaint.create(complaintData);

    return res.status(201).json({
      message: "Complaint created successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ hall: req.hallId })
      .populate("createdBy", "name email room")
      .populate({
        path: "createdBy",
        select: "name email room",
        populate: { path: "room", select: "roomNumber" },
      })

      .populate("assignedTo", "name email");
    return res.status(200).json({
      message: "Complaints retrieved successfully",
      complaints: complaints,
    });
  } catch (error) {
    console.error("Error retrieving complaints:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const myComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    return res.status(200).json({
      message: "Your complaints retrieved successfully",
      complaints: complaints,
    });
  } catch (error) {
    console.error("Error retrieving your complaints:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { userId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }
    if (complaint.hall.toString() !== req.hallId) {
      return res
        .status(403)
        .json({ message: "You can only assign complaints from your hall." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    complaint.assignedTo = userId;
    complaint.status = "in-progress";
    await complaint.save();

    return res.status(200).json({
      message: "Complaint assigned successfully",
      complaint: complaint,
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: complaint,
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    await complaint.remove();

    return res.status(200).json({
      message: "Complaint removed successfully",
    });
  } catch (error) {
    console.error("Error removing complaint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
