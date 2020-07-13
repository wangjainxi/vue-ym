/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 1.构造函数原型中拿出$mount 重写
//    1.2.下面会重新定义，覆盖原来的方法
//    1.3.扩展$mount方法
//    1.11原因是： 判断是否需要编译出渲染函数
//    1.10 除了原来的 重新定义（装饰器模式）
//    1.4.web平台特加的
//    1.5.当设置el: '#app' 其实把这个对应的div 作为template 选项
//    1.6.#app 为了成为模板，需要编译器将其编译成render 渲染函数
//    1.7.vue-cli webpack 创建的项目只能使用render函数 不能使用el 因为使用的vue版本里面没有对应的编译器
//    1.12main.js   new Vue({render(h) { return h(App) } }).$mount()  render这种方式得明确手写一个$mount()去挂载
//    1.13main.js const app = new Vue({el: "#demo"}, data: {foo: 'foo'}) el方式不需要明确指定，el已经指定了
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 1.8.拿出来用户传入的el，可能是dom元素，可能是string 选择器
  // 1.9.el 是我们的宿主元素
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  // 2.处理选项
  // 2.1 render/template/el,有优先级
  // 2.2获取用户配置的选项
  // 2.3拿出options.render渲染函数
  const options = this.$options
  // resolve template/el and convert to render function
  // 2.4 render不存在才判断template，
  // 2.5render > template > el
  // 2.6 template: 可以是<div>template</div>
  // 2.7 也可是选择器："#app"
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    // 2.8获取template编译template
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      // 3. 运行时的编译
      // 3.1从模板获取  渲染函数 =》 生成render()渲染函数
      // 3.2直接使用render() 函数 省去了编译过程，我们运行的vue没有编译器
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      // 3.3渲染函数最终重新赋值给options render
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 4.执行默认的挂载功能
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
