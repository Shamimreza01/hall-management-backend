import Hall from "../models/hall.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import getList from "../utils/getList.js";
import {
  roomRangeSchema,
  roomValidationSchema,
} from "../validations/room.validation.js";

export const createRoom = async (req, res) => {
  try {
    const { error } = roomValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { roomNumber, roomType, capacity, floor } = req.body;

    const hallId = req.hallId;

    const existingRoom = await Room.findOne({ hall: hallId, roomNumber });
    if (existingRoom) {
      return res
        .status(409)
        .json({ message: "Room already exists in your hall." });
    }

    const newRoom = await Room.create({
      hall: hallId,
      roomNumber,
      roomType,
      capacity,
      floor,
    });

    await Hall.findByIdAndUpdate(hallId, {
      $inc: { totalCapacity: capacity },
    });

    res.status(201).json({
      message: "Room created successfully.",
      room: newRoom,
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ message: "Server error while creating room." });
  }
};
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const hallId = req.hallId;

    const room = await Room.findOneAndDelete({ _id: roomId, hall: hallId });
    if (room.occupants && room.occupants.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete room with occupants." });
    }
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    await Hall.findByIdAndUpdate(hallId, {
      $inc: { totalCapacity: -room.capacity },
    });

    res.status(200).json({ message: "Room deleted successfully." });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ message: "Server error while deleting room." });
  }
};

export const bulkCreateRoomRange = async (req, res) => {
  try {
    const hallId = req.hallId;
    const { error } = roomRangeSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { startRoom, endRoom, roomType, capacity, floor } = req.body;
    if (startRoom > endRoom) {
      return res.status(400).json({ message: "startRoom must be ≤ endRoom." });
    }

    const roomsToCreate = [];
    const skippedRooms = [];
    let totalAddedCapacity = 0;

    for (let num = startRoom; num <= endRoom; num++) {
      const roomNumber = num.toString();

      const exists = await Room.findOne({ hall: hallId, roomNumber });
      if (exists) {
        skippedRooms.push({ roomNumber, reason: "Already exists" });
        continue;
      }

      roomsToCreate.push({
        hall: hallId,
        roomNumber,
        roomType,
        capacity,
        floor,
      });

      totalAddedCapacity += capacity;
    }

    const createdRooms = await Room.insertMany(roomsToCreate);

    await Hall.findByIdAndUpdate(hallId, {
      $inc: { totalCapacity: totalAddedCapacity },
    });

    res.status(201).json({
      message: "Rooms created from range.",
      totalCreated: createdRooms.length,
      totalSkipped: skippedRooms.length,
      skippedRooms,
      createdRooms,
    });
  } catch (err) {
    console.error("Range room creation error:", err);
    res.status(500).json({ message: "Server error while creating rooms." });
  }
};
export const getRoomWiseStudents = async (req, res) => {
  try {
    const hallId = req.hallId;

    // ✅ Step 1: Get all rooms of the hall sorted by floor then roomNumber
    const rooms = await Room.find({ hall: hallId })
      .sort({ floor: 1, roomNumber: 1 })
      .lean();

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found in your hall." });
    }

    // ✅ Step 2: Get all approved students of this hall
    const students = await User.find({
      role: "student",
      hall: hallId,
      approvalStatus: "approved",
    }).lean();

    // ✅ Step 3: Map students by room
    const roomWiseStudents = {};

    for (const student of students) {
      const roomId = student.studentDetails.room?.toString();
      const position = student.studentDetails.position;
      if (!roomId || !position) continue;

      if (!roomWiseStudents[roomId]) {
        roomWiseStudents[roomId] = { A: null, B: null, C: null, D: null };
      }

      roomWiseStudents[roomId][position] = {
        student,
      };
    }

    // ✅ Step 4: Group by floor
    const floorMap = new Map();

    for (const room of rooms) {
      const roomIdStr = room._id.toString();
      const roomData = {
        roomId: room._id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupants: roomWiseStudents[roomIdStr] || {
          A: null,
          B: null,
          C: null,
          D: null,
        },
      };

      if (!floorMap.has(room.floor)) {
        floorMap.set(room.floor, []);
      }

      floorMap.get(room.floor).push(roomData);
    }

    // ✅ Step 5: Convert map to sorted array
    const floorWiseData = Array.from(floorMap.entries())
      .sort((a, b) => a[0] - b[0]) // Sort floors ascending
      .map(([floor, rooms]) => ({
        floor,
        rooms,
      }));

    return res.status(200).json(floorWiseData);
  } catch (err) {
    console.error("Error in getRoomWiseStudents:", err);
    return res.status(500).json({
      message: "Server error while getting floor-wise room view.",
    });
  }
};

export const roomList = getList(Room, (req) => ({ hall: req.hallId }), {
  path: "hall",
  select: "name provost",
  populate: {
    path: "provost",
    select: "name email",
  },
});
export const roomListUsingHallId = getList(
  Room,
  (req) => ({ hall: req.query.hall }),
  null,
  "_id roomNumber"
);
