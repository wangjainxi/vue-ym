/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 1.class 也是一种函数
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 2.将除了插件之外的参数全部拿出来
    const args = toArray(arguments, 1)
    // 5.在参数前面追加上this，也就是Vue构造函数，静态方法的this，就是构造函数自己
    args.unshift(this)
    // 3.判断传进来的函数是否有install方法，有直接执行
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
    // 4.没有install方法，直接执行这个函数
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
