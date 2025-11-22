/**
 * InnoLiber Ant Design Theme Configuration
 * Rams Edition v2.0
 *
 * 基于 Dieter Rams "Less but Better" 设计哲学配置
 *
 * 设计原则：
 * 1. 群青蓝 #0437F2 作为主色
 * 2. 统一 4px 圆角
 * 3. 统一 1px 边框
 * 4. 移除阴影，使用边框
 * 5. 功能色克制使用
 */

import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // ==================== Color System ====================

    // 主色调 - 群青蓝
    colorPrimary: '#0437F2',
    colorPrimaryHover: '#0330CC',
    colorPrimaryActive: '#022199',
    colorPrimaryBorder: '#0437F2',

    // 功能色（克制使用，降低饱和度）
    colorSuccess: '#059669',      // 森林绿
    colorWarning: '#D97706',      // 琥珀色
    colorError: '#DC2626',        // 深红
    colorInfo: '#0437F2',         // 使用主色

    // 中性色
    colorText: '#171717',         // 主要文字
    colorTextSecondary: '#525252', // 次要文字
    colorTextTertiary: '#737373',  // 辅助文字
    colorTextDisabled: '#D4D4D4',  // 禁用文字

    colorBgBase: '#FFFFFF',       // 卡片背景
    colorBgContainer: '#FFFFFF',  // 容器背景
    colorBgElevated: '#FFFFFF',   // 提升背景
    colorBgLayout: '#FAFAFA',     // 页面背景 - 极浅灰

    colorBorder: '#E5E5E5',       // 边框颜色
    colorBorderSecondary: '#F5F5F5', // 次要边框

    // ==================== Border Radius (统一 4px) ====================

    borderRadius: 4,              // 基础圆角 - 所有组件默认
    borderRadiusLG: 8,            // 大圆角 - Modal、Drawer
    borderRadiusSM: 2,            // 小圆角 - 极少使用
    borderRadiusXS: 2,            // 极小圆角

    // ==================== Border Width ====================

    lineWidth: 1,                 // 标准边框宽度
    lineWidthBold: 2,             // 粗边框

    // ==================== Typography ====================

    fontSize: 16,                 // 基础字体大小
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,

    fontWeightStrong: 600,        // 强调字重

    lineHeight: 1.5,              // 行高
    lineHeightHeading1: 1.25,
    lineHeightHeading2: 1.25,
    lineHeightHeading3: 1.25,

    // ==================== Spacing (8px Grid) ====================

    marginXXS: 4,
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,

    paddingXXS: 4,
    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,
    paddingXL: 32,

    // ==================== Shadow (最小化使用) ====================

    boxShadow: 'none',            // 卡片默认无阴影
    boxShadowSecondary: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // 极浅阴影
    boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // Modal、Dropdown

    // ==================== Motion (统一 0.2s ease) ====================

    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',    // 默认过渡时间
    motionDurationSlow: '0.3s',

    motionEaseInOut: 'ease',
    motionEaseOut: 'ease',

    // ==================== Control Heights ====================

    controlHeight: 40,            // 标准控件高度
    controlHeightLG: 48,          // 大控件高度
    controlHeightSM: 32,          // 小控件高度
    controlHeightXS: 24,          // 极小控件高度

    // ==================== Z-Index ====================

    zIndexPopupBase: 1000,
    zIndexBase: 0,
  },

  components: {
    // ==================== Button ====================
    Button: {
      controlHeight: 40,
      borderRadius: 4,
      paddingContentHorizontal: 16,
      fontWeight: 500,

      // Primary 按钮
      colorPrimary: '#0437F2',
      colorPrimaryHover: '#0330CC',
      colorPrimaryActive: '#022199',

      // 移除阴影
      primaryShadow: 'none',
      defaultShadow: 'none',

      // 边框
      lineWidth: 1,
      lineType: 'solid',
    },

    // ==================== Input ====================
    Input: {
      controlHeight: 40,
      borderRadius: 4,
      paddingBlock: 8,
      paddingInline: 16,

      // 边框
      lineWidth: 1,
      colorBorder: '#E5E5E5',

      // 移除阴影
      activeShadow: 'none',
    },

    // ==================== Card ====================
    Card: {
      borderRadius: 4,
      paddingLG: 24,

      // 移除阴影，使用边框
      boxShadowTertiary: 'none',
      lineWidth: 1,
      colorBorderSecondary: '#E5E5E5',
    },

    // ==================== Table ====================
    Table: {
      borderRadius: 4,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,

      // 边框
      lineWidth: 1,
      colorBorderSecondary: '#E5E5E5',
    },

    // ==================== Modal ====================
    Modal: {
      borderRadius: 8,
      paddingContentHorizontal: 24,
      paddingLG: 24,

      // 保留轻微阴影
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },

    // ==================== Drawer ====================
    Drawer: {
      borderRadius: 0,
      padding: 24,

      // 保留轻微阴影
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },

    // ==================== Select ====================
    Select: {
      controlHeight: 40,
      borderRadius: 4,

      // 边框
      lineWidth: 1,
      colorBorder: '#E5E5E5',

      // 移除阴影
      boxShadowSecondary: 'none',
    },

    // ==================== DatePicker ====================
    DatePicker: {
      controlHeight: 40,
      borderRadius: 4,

      // 边框
      lineWidth: 1,
      colorBorder: '#E5E5E5',
    },

    // ==================== Tag ====================
    Tag: {
      borderRadius: 4,
      lineWidth: 1,

      // 透明背景 + 边框（Rams 风格）
      defaultBg: 'transparent',
      defaultColor: '#171717',
      colorBorder: '#E5E5E5',
    },

    // ==================== Progress ====================
    Progress: {
      lineWidth: 4,              // 4px 高度
      borderRadius: 4,

      defaultColor: '#0437F2',
      remainingColor: '#F5F5F5',
    },

    // ==================== Badge ====================
    Badge: {
      dotSize: 8,
      indicatorHeight: 20,
      indicatorHeightSM: 16,

      colorBorderBg: '#FFFFFF',
    },

    // ==================== Menu ====================
    Menu: {
      itemBorderRadius: 4,
      itemHeight: 40,
      itemPaddingInline: 16,

      // 激活态使用主色
      itemSelectedColor: '#0437F2',
      itemSelectedBg: '#E6F0FF',

      // 边框
      colorSplit: '#E5E5E5',
    },

    // ==================== Tabs ====================
    Tabs: {
      itemColor: '#737373',
      itemSelectedColor: '#0437F2',
      itemHoverColor: '#0330CC',

      // 指示器
      inkBarColor: '#0437F2',

      // 边框
      lineWidth: 1,
      lineType: 'solid',
    },

    // ==================== Form ====================
    Form: {
      labelFontSize: 14,
      labelColor: '#525252',
      labelHeight: 32,

      verticalLabelPadding: 4,
    },

    // ==================== Notification ====================
    Notification: {
      borderRadius: 8,
      padding: 16,

      // 保留轻微阴影
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },

    // ==================== Message ====================
    Message: {
      borderRadius: 8,
      contentPadding: 12,

      // 保留轻微阴影
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },

    // ==================== Tooltip ====================
    Tooltip: {
      borderRadius: 4,
      paddingXS: 8,

      // 深色背景
      colorBgSpotlight: '#171717',
      colorTextLightSolid: '#FFFFFF',
    },
  },
};

export default theme;
