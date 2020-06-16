var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Chart = require('echarts');

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container = $(container);           //容器
  this.apis = config.apis;                 //hook一定要有
  this._data = null;                       //数据
  this.chart = null;                       //图表
  this.init(config);
}, {
  /**
   * 公有初始化
   */
  init: function (config) {
    //1.初始化,合并配置
    this.mergeConfig(config);
    //2.刷新布局,针对有子组件的组件 可有可无
    this.updateLayout();
    //3.子组件实例化
    this.chart = Chart.init(this.container[0]);
    //4.如果有需要, 更新样式
    this.updateStyle();
  },
  /**
   * 绘制
   * @param data
   * @param options 不一定有
   * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
   */
  render: function (data, config) {
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    //更新图表
    // this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    this.chart.setOption(this.optionData(data, cfg));
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  optionData(data, config) {
    let realData = [];
    let compareAry = [];
    let max = 0;
    data.forEach(item => {
      realData.push(item.value);
      compareAry.push(item.value);
    });
    max = Math.max(...compareAry);
    max = max > 1 ? max * 1.2 : 1; 
    data.forEach(item => {
      item.max = max;
    })
    return {
      color: '#1feffe',
      radar: {
        name: {
          formatter: function(a, b) {
            return max > 1 ? `{b|${b.value}}{c|${config.unit}}\n{a|${a}}` : `{b|${(b.value * 100).toFixed(2)}}{c|${config.unit}}\n{a|${a}}`;
          },
          rich: {
            a: {
              align: 'center',
              color: config.radar.tName.rich.a.color,
              fontSize: config.radar.tName.rich.a.fontSize,
              fontWeight: config.radar.tName.rich.a.fontWeight
            },
            b: {
              align: 'center',
              color: config.radar.tName.rich.b.color,
              fontSize: config.radar.tName.rich.b.fontSize,
              fontWeight: config.radar.tName.rich.b.fontWeight
            },
            c: {
              align: 'center',
              color: config.radar.tName.rich.c.color,
              fontSize: config.radar.tName.rich.c.fontSize,
              fontWeight: config.radar.tName.rich.c.fontWeight
            },
          }
        },
        radius: '60%',
        indicator: data,
        splitArea: { // 坐标轴在 grid 区域中的分隔区域，默认不显示。
          show: true,
          areaStyle: { // 分隔区域的样式设置。
            color: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'], // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
          }
        },
        axisLine: { //指向外圈文本的分隔线样式
          lineStyle: {
            color: '#055cd1'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#055cd1', // 分隔线颜色
            width: 2, // 分隔线线宽
          }
        },
      },
      series: [{
        type: 'radar',
        symbolSize: 10,
        data: [{
          value: realData,
          itemStyle: {
            normal: {
              lineStyle: {
                color: '#1feffe'
              },
              shadowColor: '#1feffe'
            }
          },
          areaStyle: {
            normal: { // 单项区域填充样式
              color: '#1882b8',
              opacity: 0.7 // 区域透明度
            }
          }
        }]
      }]
    }
  },
  /**
   *
   * @param width
   * @param height
   */
  resize: function (width, height) {
    this.updateLayout(width, height);
    //更新图表
    this.chart.resize({
     width: width,
     height: height
    })
  },
  /**
   * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
   * 暂时可以不填内容
   */
  setColors: function () {
    //比如
    //var cfg = this.config;
    //cfg.color = cfg.theme.series[0] || cfg.color;
  },
  /**
   * 数据,设置和获取数据
   * @param data
   * @returns {*|number}
   */
  data: function (data) {
    if (data) {
      this._data = data;
    }
    return this._data;
  },
  /**
   * 更新配置
   * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
   * [注] 有数组的配置一定要替换
   * @param config
   * @private
   */
  mergeConfig: function (config) {
    if (!config) {return this.config}
    this.config.theme = _.defaultsDeep(config.theme || {}, this.config.theme);
    this.setColors();
    this.config = _.defaultsDeep(config || {}, this.config);
    return this.config;
  },
  /**
   * 更新布局
   * 可有可无
   */
  updateLayout: function () {},
  /**
   * 更新样式
   * 有些子组件控制不到的,但是需要控制改变的,在这里实现
   */
  updateStyle: function () {
    var cfg = this.config;
    this.container.css({
      'font-size': cfg.size + 'px',
      'color': cfg.color || '#fff'
    });
  },
  /**
   * 更新配置
   * !!注意:如果render支持第二个参数options, 那updateOptions不是必须的
   */
  //updateOptions: function (options) {},
  /**
   * 更新某些配置
   * 给可以增量更新配置的组件用
   */
  //updateXXX: function () {},
  /**
   * 销毁组件
   */
   destroy: function(){
    this.chart && this.chart.dispose && this.chart.dispose();
   }
});