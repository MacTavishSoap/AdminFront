import { ElMessage } from "element-plus";

const showMesaage = (msg,callback,type) =>{
    ElMessage({
        type:type,
        message:msg,
        duration:2000,
        onClose:() => {
            if(callback){
                callback();
            }
        }
    })
}

const message = {
    error: (msg,callback) => {
        showMesaage(msg,callback,"error");
    },
    success:(msg,callback) => {
        showMesaage(msg,callback,"success")
    },
    success:(msg,callback) => {
        showMesaage(msg,callback,"warning")
    },

}

export default message;