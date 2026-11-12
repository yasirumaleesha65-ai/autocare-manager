import Counter from "../models/Counter.js";

export const getNextSequence = async (counterName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return counter.sequence;
};
