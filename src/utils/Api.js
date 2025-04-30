import Request from "./Request"
export default {
    //验证码
    captcha() {
        return Request({
            url: "/checkCode",
            method: 'get',
        })
    },

    login(params) {
        return Request({
            url: "/login",
            method: 'post',
            data: params,
        })
    },

    menulist(params) {
        return Request({
            url: "/sysMenu/list",
            method: 'get',
            data: params,
        })
    },

    menuadd(params) {
        return Request({
            url: "/sysMenu/add",
            method: 'post',
            data: params,
        })
    },

    menudelete(id) {
        return Request({
            url: "/sysMenu/delete",
            method: 'delete',
            data: id,
        })
    },
    menuupdate(params) {
        return Request({
            url: "/sysMenu/update",
            method: 'put',
            data: params,
        })
    },
    menuinfo(id) {
        return Request({
            url: "/sysMenu/add",
            method: 'get',
            data: id,
        })
    },
    //角色接口
    rolelist(params) {
        return Request({
            url: "/sysRole/list",
            method: 'get',
            data: params,
        })
    },
    roleadd(params) {
        return Request({
            url: "/sysRole/add",
            method: 'post',
            data: params,
        })
    },
    roledelete(id) {
        return Request({
            url: "/sysRole/delete",
            method: 'delete',
            data: id,
        })
    },
    rolevoidlist(id) {
        return Request({
            url: "/sysRole/vo/idlist",
            method: 'get',
            data: id,
        })
    },
    rolevolist(params) {
        return Request({
            url: "/sysRole/vo/list",
            method: 'get',
            data: params,
        })
    },
    roleupdate(params) {
        return Request({
            url: "/sysRole/update",
            method: 'put',
            data: params,
        })
    },
    roleupdatestatus(params) {
        return Request({
            url: "/sysRole/updateStatus",
            method: 'put',
            data: params,
        })
    },
    roleassignpermissions(params) {
        return Request({
            url: "/sysRole/vo/assignPermissions",
            method: 'put',
            data: params,
        })
    },

    adminadd(params) {
        return Request({
            url: "/sysAdmin/add",
            method: 'post',
            data: params,
        })
    },
    admindelete(id) {
        return Request({
            url: "/sysAdmin/delete",
            method: 'delete',
            data: id,
        })
    },
    adminlist(params) {
        return Request({
            url: "/sysAdmin/list",
            method: 'get',
            data: params,
        })
    },
    adminupdate(params) {
        return Request({
            url: "/sysAdmin/update",
            method: 'put',
            data: params,
        })
    },
    adminupdatepw(params) {
        return Request({
            url: "/sysAdmin/updatePassword",
            method: 'put',
            data: params,
        })
    },
    adminupdatestatus(params) {
        return Request({
            url: "/sysAdmin/updateStatus",
            method: 'put',
            data: params,
        })
    },


    questionlist(params) {
        return Request({
            url: "/question/list",
            method: 'get',
            data: params,
        })
    },
    questionadd(params) {
        return Request({
            url: "/question/add",
            method: 'post',
            data: params,
        })
    },
    questionupdate(params) {
        return Request({
            url: "/question/update",
            method: 'put',
            data: params,
        })
    },
    questionupdatestatus(params) {
        return Request({
            url: "/question/updateStatus",
            method: 'put',
            data: params,
        })
    },
    questiondelete(id) {
        return Request({
            url: "/question/delete",
            method: 'delete',
            data: id,
        })
    },
    questionvolist(params) {
        return Request({
            url: "/question/vo/category",
            method: 'get',
            data: params,
        })
    },

    categorylist(params) {
        return Request({
            url: "/category/list",
            method: 'get',
            data: params,
        })
    },
    deletecategory(id) {
        return Request({
            url: "/question/deleteCategory",
            method: 'delete',
            data: id,
        })
    },
    categoryadd(params) {
        return Request({
            url: "/question/category/add",
            method: 'post',
            data: params
        })
    },
    batchadd(formData) {
        return Request({
            url: "/question/batchadd",
            method: 'post',
            data: formData,  // 直接传递 FormData
            headers: {
                // 不设置 Content-Type，axios 会自动处理
            }
        });
    },

    banlist(params) {
        return Request({
            url: "/app/banlist",
            method: 'get',
            data: params,
        });
    },
    banadd(formData) {
        return Request({
            url: "/app/banadd",
            method: 'post',
            data: formData,  // 直接传递 FormData
        });
    },
    banupdatestatus(params) {
        return Request({
            url: "/app/updateStatus",
            method: 'put',
            data: params,
        })
    },
    deletebans(id) {
        return Request({
            url: "/app/deleteban",
            method: 'delete',
            data: id,
        })
    },
    //角色接口
    userrolelist(params) {
        return Request({
            url: "/UserRole/list",
            method: 'get',
            data: params,
        })
    },
    userroleadd(params) {
        return Request({
            url: "/UserRole/add",
            method: 'post',
            data: params,
        })
    },
    userroledelete(id) {
        return Request({
            url: "/UserRole/delete",
            method: 'delete',
            data: id,
        })
    },
    userrolevoidlist(id) {
        return Request({
            url: "/UserRole/vo/idlist",
            method: 'get',
            data: id,
        })
    },
    userrolevolist(params) {
        return Request({
            url: "/UserRole/vo/list",
            method: 'get',
            data: params,
        })
    },
    userroleupdate(params) {
        return Request({
            url: "/UserRole/update",
            method: 'put',
            data: params,
        })
    },
    userroleupdatestatus(params) {
        return Request({
            url: "/UserRole/updateStatus",
            method: 'put',
            data: params,
        })
    },
    userroleassignpermissions(params) {
        return Request({
            url: "/UserRole/vo/assignPermissions",
            method: 'put',
            data: params,
        })
    },
    userlist(params) {
        return Request({
            url: "/User/list",
            method: 'get',
            data: params,
        })
    },
    userupdatestatus(params) {
        return Request({
            url: "/User/updateStatus",
            method: 'put',
            data: params,
        })
    },
    stats(params){
        return Request({
            url:"/dashboard/stats",
            method:'get',
            data:params,
        })
    }





} 