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
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  optionData(data, config) {
    const xAxisData = [];
    const yAxisData1 = [];
    const yAxisData2 = [];
    data.forEach(item => {
      xAxisData.push(item.name);
      yAxisData1.push(item.value1);
      yAxisData2.push(item.value2);
    });
    return {
      grid: {
        left: config.grid.left,
        right: config.grid.right,
        top: config.grid.top,
        bottom: config.grid.bottom,
        containLabel: true
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            type: 'solid',
            width: 2,
            color: '#fff'
          }
        },
        textStyle: {
          color: '#fff',
          fontSize: 28,
          fontWeight: 'bold'
        }
      },
      legend: {
        show: true,
        y: '5',
        right: config.legend.right,
        icon: 'circle',
        itemWidth: 15,
        itemHeight: 15,
        itemGap: 45,
        textStyle: {
          color: config.legend.textStyle.color,
          fontSize: config.legend.textStyle.fontSize,
          fontWeight: 'bold'
        },
        data: ['开工', '竣工']
      },
      xAxis: [{
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: config.xAxis.axisLabel.textStyle.color,
          fontSize: config.xAxis.axisLabel.textStyle.fontSize,
          fontWeight: config.xAxis.axisLabel.textStyle.fontWeight,
          margin: config.xAxis.axisLabel.margin,
          rotate: 45
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: '#0072ff',
            width: config.xAxis.axisLine.lineStyle.width
          }
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false
        },
        data: xAxisData
      }],
      yAxis: [
        {
          type: 'value',
          name: '',
          nameTextStyle: {
            color: config.yAxis.nameTextStyle.color,
            fontSize: config.yAxis.nameTextStyle.fontSize,
            fontWeight: config.yAxis.nameTextStyle.fontWeight,
          },
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: config.yAxis.axisLabel.textStyle.color,
              fontSize: config.yAxis.axisLabel.textStyle.fontSize,
              fontWeight: config.yAxis.axisLabel.textStyle.fontWeight,
            },
            margin: config.yAxis.axisLabel.margin
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#0072ff',
              width: config.yAxis.axisLine.lineStyle.width
            }
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#103062',
              width: 1.5
            }
          }
        }
      ],
      series: [{
        name: '开工',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: yAxisData1,
        areaStyle: {
          normal: {
            color: new Chart.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#2599FF'
            }, {
              offset: 1,
              color: 'rgba(97, 205, 255, 0)'
            }], false)
          }
        },
        itemStyle: {
          normal: {
            color: '#2599FF'
          }
        },
        lineStyle: {
          width: 2.5
        }
      }, 
      {
        name: '竣工',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: yAxisData2,
        areaStyle: {
          normal: {
            color: new Chart.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#57EECF'
            }, {
              offset: 1,
              color: 'rgba(87, 238, 207, 0)'
            }], false)
          }
        },
        itemStyle: {
          normal: {
            color: '#57EECF'
          }
        },
        lineStyle: {
          width: 2.5
        }
      }]
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
   destroy: function(){console.log('请实现 destroy 方法')}
});