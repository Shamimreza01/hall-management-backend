const hall = {
  name: "student hall 1",
  gender: "male",
  location: "south-west corner of PUST campus",
  description: "........................",
  totalFloors: 5,
  totalBlock: 2,
  monthlyRent: 250,
  totalCapacity: 500,
  currentOccupants: 0,
  facillities: ["free wifi", "pure water", "24/7 electricity"],
  contactEmail: "bsmr.hall@pust.ac.bd",
  contactPhone: "+8802588845707",
  isActive: true,
};
/* hall creation data
{
  "name": "Female hall 2",
  "gender": "female",
  "location": "south-east corner of PUST campus",
  "description": "........................",
  "totalFloors": 10,
  "totalBlocks": 1,
  "monthlyRent": 350,
  "facilities": [
    "free wifi",
    "pure water",
    "24/7 electricity"
  ],
  "contactEmail": "femalehall2@pust.ac.bd",
  "contactPhone": "+8800000000000",
  "isActive": true
} 
  */

const provost = {
  name: "",
  email: "",
  password: "",
  phone: "",
  altPhone: "",
  profilePhoto: "",
  hall: "",
};
/*
Student Hall-1
name:Dr. Md. Shahajan Ali
email:msali@pust.ac.bd
password:msali@pust.ac.bd
profilePhoto:file
phone:01323886868
altPhone:0000000000
hall:688677ef0825d585c1affd0e
secretCode:p2r0o0v0o8st

Female Hall-1 
name:Dr. Jinnat Rehana
email:jinnat.pust@gmail.com
password:jinnat.pust@gmail.com
phone:01717656781
altPhone:0000000000
hall:68867b2d0825d585c1affd14
secretCode:p2r0o0v0o8st

Student Hall-2 
name:Dr. Md. Kamruzzaman
email:kamrul_mba@pust.ac.bd
password:kamrul_mba@pust.ac.bd
phone:01716183432
altPhone:073165265
hall:6886debf0825d585c1affd17
secretCode:p2r0o0v0o8st
*/

const viceProvost = {
  name: "",
  email: "",
  password: "",
  phone: "",
  altPhone: "",
  profilePhoto: "",
  designation: "",
  responsibilites: "",
  hall: "",
};
const student = {
  roll: "",
  registration: "",
  academicSession: "",
  admissionYear: "",
  department: "",
  fatherName: "",
  motherName: "",
  fatherPhone: "",
  emergencyContact: "",
  permanentAddress: "",
  bloodGroup: "",
  medicalInfo: "",
  hall: "",
  room: "",
  position: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  altPhone: "",
  profilePhoto: "",
};
/*
const shamim={
  roll:200311
  registration:1032428 
  academicSession:2019-2020
  addmissionYear:2020
  department: mathematics 
  fatherName: md lutfor rahman 
  motherName: mst samena bibi
  fatherPhone: 01779190991 
  emergencyContact: 01339142735 
  permanentAddress: sainpara shainpara-6250 bagmara rajshahi 
  bloodGroup:A+ 
  medicalInfo:normal 
  name: MD Shamim Reza
  phone: 01797903116 
  altPhone: 01703581778 
  email:srshamimreza97903116@gmail.com 
  password:srshamimreza97903116@gmail.com 
  hall: 688677ef0825d585c1affd0e 
  room: 688b8300b5feccf1f2330800
  position:C
}

roll:
registration:
academicSession:
admissionYear:
department:
fatherName:
motherName:
fatherPhone:
emergencyContact:
permanentAddress: 
bloodGroup:A+
medicalInfo:normal
name:
phone:
altPhone:
email:
password:
hall:688677ef0825d585c1affd0e
room:688b8300b5feccf1f2330800
position:C
*/
const room = {
  roomNumber: "",
  roomType: "",
  capacity: "",
  floor: "",
};
/* simgle room creation
{
    "roomNumber":"426",
    "roomType":"4-bed",
    "capacity":4,
    "floor":4
}
    //bulk room creation :
    {   "startRoom":419,
    "endRoom":423,
    "roomType":"4-bed",
    "capacity":4,
    "floor":4
}

*/
