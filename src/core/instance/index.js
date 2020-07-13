import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 1.真正的构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 2.初始化 this._init(options)
  // 2.1此方法是哪里来的
  this._init(options)
}

// 3.以下这些方法都在实现实例方法，实例方法的初始化
// 4.Vue做了混入，混入了_init 方法
initMixin(Vue) // 4.1_init()方法真正的混入
stateMixin(Vue) // 5.实现状态相关 $set $watch $delete $data $props 等方法
eventsMixin(Vue) // 6.$emit $on $off $once 实现事件相关的方法
lifecycleMixin(Vue) // 7.$update $forceUpdate $destroy
renderMixin(Vue)  // 8. 渲染相关 声明并实现了$nextTick/ render()

export default Vue
