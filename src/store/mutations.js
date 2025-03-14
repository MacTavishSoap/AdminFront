// mutations.js
import storage from "@/utils/storage";

export default {
    // 存 token
    saveToken(state, token) {
        state.token = token;
        storage.setItem("token", token);
    },
    // 存储用户信息
    saveSysAdmin(state, sysAdmin) {
        state.sysAdmin = sysAdmin;
        storage.setItem("sysAdmin", sysAdmin);
    },
    // 存储左侧菜单
    saveLeftMenuList(state, leftMenuList) {
        state.leftMenuList = leftMenuList;
        storage.setItem("leftMenuList", leftMenuList);
    },
    // 存储权限列表
    savePermissionList(state, permissionList) {
        state.permissionList = permissionList;
        storage.setItem("permissionList", permissionList);
    },
    //路由
    saveActivePath(state,actviePath){
        state.actviePath = actviePath
        storage.setItem('activePath',actviePath)
    }
};
