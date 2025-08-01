import router from '@/router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import storage from './storage';

const instance = axios.create({
    baseURL: '/api',
    timeout: 10 * 1000,
});

// 请求拦截器
instance.interceptors.request.use(
    (req) => {
        const headers = req.headers;
        const token = storage.getItem("token") || "";
        
        // 添加管理端标识
        headers['X-Client-Type'] = 'admin';

        if (!headers.Authorization && token) {
            headers.Authorization = 'Bearer ' + token;
        }
        return req;
    }
);


// 响应拦截器
instance.interceptors.response.use(
    (res) => {
        const { code, data, message } = res.data;
        if (code == 403 || code == 901 || code == 401) {
            ElMessage.error(message || '用户未登录或登录已过期');
            storage.clearAll();
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } else if (code == 200) {
            return res.data;
        } else {
            ElMessage.error(message || '请求失败');
        }
    },
    (error) => {
        // 处理HTTP状态码错误
        if (error.response && error.response.status === 401) {
            ElMessage.error('用户未登录或登录已过期');
            storage.clearAll();
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } else {
            ElMessage.error('网络请求失败');
        }
        return Promise.reject(error);
    }
);



// 请求函数封装
const Request = (options) => {
    options.method = options.method || 'get';

    // 如果是文件上传，处理 FormData
    if (options.method.toLowerCase() === 'post' && options.data instanceof FormData) {
        // 如果传递的是 FormData，axios 会自动设置 Content-Type 为 multipart/form-data
        return instance(options);
    }

    if (options.method.toLowerCase() === 'get') {
        options.params = options.data;
    } else if (options.method.toLowerCase() === 'post' && options.data && !(options.data instanceof FormData)) {
        // 如果不是 FormData 类型，处理为 JSON
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
        };
    }
    
    return instance(options);
};

export default Request;
