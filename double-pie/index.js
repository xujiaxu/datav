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
    this.chart.setOption(this.optionData(data, cfg));
    //更新图表
    //this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  optionData(data, config) {
    // console.log(config);
    let total = 0;
    data.forEach(item => {
      total += item.value;
    });
    return {
      tooltip : {
        show: true,
        formatter: "{b} : {d}%",
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      title: {
        text: `{a|${total}}{b| 万个}`,
        x: 'center',
        y: config.title.y,
        textStyle: {
          rich: {
            a: {
              color: config.title.textStyle.rich.a.color,
              fontSize: config.title.textStyle.rich.a.fontSize,
              fontWeight: config.title.textStyle.rich.a.fontWeight,
              padding: config.title.textStyle.rich.a.padding
            },
            b: {
              color: config.title.textStyle.rich.b.color,
              fontSize: config.title.textStyle.rich.b.fontSize,
              fontWeight: config.title.textStyle.rich.b.fontWeight,
              padding: config.title.textStyle.rich.b.padding,
              align: 'bottom',
            }
          }
        }
      },
      series: [
        {
          name: 'pie1',
          type: 'pie',
          clockWise: true,
          startAngle: -120, 
          hoverAnimation: false,
          label: {
            show: false
          },
          radius: [config.series[0].radius[0].rValue, config.series[0].radius[1].rValue],
          data: [
            {
                value: data[0].value,
                name: data[0].name,
                itemStyle: {
                  color: '#0787d9'
                }
            }, 
            {
              value: total,
              name: '总数',
              tooltip: {
                show: false
              },
              itemStyle: {
                color: 'rgba(0,0,0,0)',
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                },
                emphasis: {
                  color: 'rgba(0,0,0,0)'
                }
              }
            }
          ]
        }, 
        {
          name: 'pie2',
          type: 'pie',
          clockWise: true,
          startAngle: -120, 
          radius: [config.series[1].radius[0].rValue, config.series[1].radius[1].rValue],
          hoverAnimation: false,
          label: {
            show: false
          },
          data: [
            {
              value: data[1].value,
              name: data[1].name,
              itemStyle: {
                color: '#f0a530'
              }
            }, 
            {
              value: total,
              name: '总数',
              tooltip: {
                show: false
              },
              itemStyle: {
                color: 'rgba(0,0,0,0)',
                label: {
                  show: false
                },
                labelLine: {
                    show: false
                },
                emphasis: {
                  color: 'rgba(0,0,0,0)'
                }
              }
            }
          ]
        }
      ]
    };
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
  clear: function () {
    this.chart && this.chart.clear && this.chart.clear();
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