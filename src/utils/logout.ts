import cookies from "js-cookie";
import { useUserStore } from "@/store/User";

export function logout() {
    const userStore = useUserStore()
    localStorage.removeItem('user')
    userStore.logout()
    cookies.remove('token')
}
