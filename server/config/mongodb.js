import mongoose from 'mongoose';

const connectDB = async ()=>{

    mongoose.connection.on('connected',()=>{
        console.log('MongoDB connected successfully');
    })
    mongoose.connection.on('error',()=>{
        console.log('MongoDB connection failed');
    })
    await mongoose.connect(`${process.env.MONGODB_URI}authnext`);
}

export default connectDB;