import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance  创建一个axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests  跨域请求时发送cookie
  timeout: 5000 // request timeout  请求超时
})

// request interceptor  请求拦截器
service.interceptors.request.use(
  config => {
    // do something before request is sent  在发送请求之前做一些事情

    if (store.getters.token) {
      // let each request carry token --['X-Token'] as a custom key.  让每个请求携带令牌 -  ['X-Token']作为自定义键。
      // please modify it according to the actual situation.  请根据实际情况进行修改。
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error  做一些请求错误
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor 响应拦截器
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status 如果您想获取标题或状态等信息
   * Please return  response => response   请返回响应=>响应
  */

  /**
   * Determine the request status by custom code  通过自定义代码确定请求状态
   * Here is just an example  这只是一个例子
   * You can also judge the status by HTTP Status Code.  您还可以通过HTTP状态代码判断状态。
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.  如果自定义代码不是20000，则判断为错误。
    if (res.code !== 20000) {
      Message({
        message: res.message || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // 50008：非法令牌; 50012：其他客户登录; 50014：令牌已过期;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        // 您已退出，可以取消此页面，或者重新登录
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(res.message || 'error')
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
