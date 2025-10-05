// tiny auth helper: store/get/remove JWT and user info from localStorage
const TOKEN_KEY = 'hms_token'
const USER_KEY = 'hms_user'

export default {
  getToken() {
    try { return localStorage.getItem(TOKEN_KEY) }
    catch(e){ return null }
  },
  setToken(token){
    try{ localStorage.setItem(TOKEN_KEY, token) }catch(e){}
  },
  clearToken(){
    try{ localStorage.removeItem(TOKEN_KEY) }catch(e){}
  },
  // user helpers store a small object (id, username, email, role)
  setUser(user){
    try{ localStorage.setItem(USER_KEY, JSON.stringify(user||{})) }catch(e){}
  },
  getUser(){
    try{ const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null }catch(e){ return null }
  },
  clearUser(){
    try{ localStorage.removeItem(USER_KEY) }catch(e){}
  },
  clearAll(){ this.clearToken(); this.clearUser() }
}
