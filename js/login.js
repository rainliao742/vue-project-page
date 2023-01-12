//const { default: axios } = require("axios");

const url = "https://vue3-course-api.hexschool.io/v2"; //公用加入點
const path = 'richliao' //個人path

const App = {
  data() {
    return {
      user: {
        //登入資訊
        username: "",
        password: "",
      },
    };
  },
  methods:{
    login(){//登入資訊
      axios.post(`${url}/admin/signin`, this.user)
      .then((res)=>{
        const { token, expired } = res.data; // 取出遠端 cookiem,token, 登入檔案
        document.cookie = `richToken=${token}; expires=${new Date(expired)};`;  //hexToken 必須跟 product 頁面一樣設定名稱
        location.href='products.html'
        alert(res.data.message);
      })
      .catch((err)=>{
        alert(err.data.message);
      })
    }
  }
};
Vue.createApp(App).mount("#app");
