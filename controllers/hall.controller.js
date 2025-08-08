import Hall from "../models/hall.model.js";
import getList from "../utils/getList.js";
import { hallValidationSchema } from "../validations/hall.validation.js";

export const createHall = async (req, res) => {
  try {
    const { error } = hallValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      name,
      gender,
      location,
      description,
      totalFloors,
      totalBlocks,
      monthlyRent,
      facilities = [],
      contactEmail,
      contactPhone,
      isActive,
    } = req.body;

    const hallExists = await Hall.findOne({ name });
    if (hallExists)
      return res.status(409).json({ message: "Hall name already exists." });

    const newHall = await Hall.create({
      name,
      gender,
      location,
      description,
      totalFloors,
      totalBlocks,
      monthlyRent,
      facilities,
      contactEmail,
      contactPhone,
      isActive,
    });

    res.status(201).json({
      message: "Hall created successfully.",
      hall: newHall,
    });
  } catch (err) {
    console.error("Error creating hall:", err);
    res.status(500).json({ message: "Server error while creating hall." });
  }
};
export const updateHall = async (req, res) => {
  try {
    const { hallId } = req.params;
    const updates = req.body;

    const hall = await Hall.findByIdAndUpdate(hallId, updates, {
      new: true,
      runValidators: true,
    });

    if (!hall) return res.status(404).json({ message: "Hall not found." });

    res.status(200).json({ message: "Hall updated successfully.", hall });
  } catch (error) {
    console.error("Update hall error:", error);
    res.status(500).json({ message: "Server error during hall update." });
  }
};
export const deactivateHall = async (req, res) => {
  try {
    const { hallId } = req.params;

    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ message: "Hall not found." });

    hall.isActive = false;
    await hall.save();

    res.status(200).json({ message: "Hall deactivated successfully." });
  } catch (error) {
    console.error("Deactivate hall error:", error);
    res.status(500).json({ message: "Server error during deactivation." });
  }
};
export const hallsList = getList(Hall, (req) => {});
export const activeHallsList = getList(Hall, (req) => ({
  isActive: true,
}));
export const deactivateHallsList = getList(Hall, (req) => ({
  isActive: false,
}));

export const hallListForReg = getList(Hall, (req) => ({}), null, "_id name");
