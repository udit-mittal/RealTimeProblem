const express =require('express');
const app=express();
const PORT = process.env.PORT;
const rootRouter=require('./routes/index');

const cors=require('cors');
app.use(cors());
app.use(express.json());

app.use("/myproject/u1",rootRouter);
app.listen(PORT,()=>{
    console.log("server is running on port 3000");
});