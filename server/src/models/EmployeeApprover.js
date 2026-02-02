import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const EmployeeApproverSchema = new Schema(
  {
    employeeID: {
      type: ObjectId,
      ref:"Employee",
      trim: true,
    },
    approvals:{
        currentLevel:{
            type:String
        },
        levelOne:{
            levelOneApprover: {
              type: ObjectId,
              ref:"Employee",
              trim: true,
            },
            date:Date()

        },
    levelTwoApprover: {
      type: ObjectId,
      ref:"Employee",
      trim: true,
    },
    levelThreeApprover: {
      type: ObjectId,
      ref:"Employee",
      trim: true,
    },
    levelFourApprover: {
      type: ObjectId,
      ref:"Employee",
      trim: true,
    },
    levelFiveApprover: {
      type: ObjectId,
      ref:"Employee",
      trim: true,
    },
    },
  },
  { timestamps: true }
);


export default model('EmployeeApprover', EmployeeApproverSchema);