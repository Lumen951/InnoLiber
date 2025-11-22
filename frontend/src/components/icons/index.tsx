/**
 * InnoLiber Icon System
 * Rams Edition v2.0
 *
 * Lucide Icons 映射系统
 * 从 emoji 迁移到极简线性图标
 *
 * 图标规范：
 * - 线宽: 2px (默认) / 2.5px (强调)
 * - 尺寸: 16px (列表) / 20px (导航、按钮) / 24px (标题)
 * - 颜色: #737373 (默认) / #0437F2 (激活) / #D4D4D4 (禁用)
 */

import {
  // 核心功能图标
  FileText,       // 📝 标书管理
  BarChart3,      // 📊 数据分析
  BookOpen,       // 📚 文献库
  Settings,       // ⚙️ 设置
  Home,           // 🏠 首页

  // 操作图标
  Plus,           // ➕ 新建
  Edit3,          // ✏️ 编辑
  Trash2,         // 🗑️ 删除
  Save,           // 💾 保存
  Download,       // 📥 下载
  Upload,         // 📤 上传
  Eye,            // 👁️ 查看
  EyeOff,         // 隐藏
  Search,         // 🔍 搜索
  Filter,         // 筛选
  RefreshCw,      // 刷新
  Copy,           // 复制
  Check,          // ✓ 确认
  X,              // ✕ 关闭

  // 状态图标
  CheckCircle2,   // ✅ 完成
  Clock,          // ⏱️ 进行中
  AlertCircle,    // ⚠️ 警告
  XCircle,        // ❌ 错误
  Info,           // ℹ️ 信息
  HelpCircle,     // ❓ 帮助

  // AI功能图标
  Sparkles,       // ✨ AI 功能
  Lightbulb,      // 💡 建议
  Zap,            // ⚡ 快速操作
  TrendingUp,     // 📈 趋势上升
  Target,         // 🎯 目标

  // 导航图标
  ChevronLeft,    // ← 返回
  ChevronRight,   // → 前进
  ChevronDown,    // ▼ 下拉
  ChevronUp,      // ▲ 上拉
  Menu,           // ☰ 菜单
  MoreVertical,   // ⋮ 更多（竖向）
  MoreHorizontal, // ⋯ 更多（横向）

  // 用户相关
  User,           // 👤 用户
  Users,          // 👥 团队
  LogIn,          // 登录
  LogOut,         // 登出
  UserPlus,       // 注册
  Lock,           // 🔒 密码/锁定
  Unlock,         // 🔓 解锁
  Mail,           // 📧 邮件
  Phone,          // 📱 电话

  // 文档相关
  File,           // 📄 文件
  FileCheck,      // 已审核文件
  FilePlus,       // 新建文件
  Folder,         // 📁 文件夹
  FolderOpen,     // 打开文件夹
  Link2,          // 🔗 链接
  ExternalLink,   // 外部链接

  // 编辑器相关
  Bold,           // B 粗体
  Italic,         // I 斜体
  Underline,      // U 下划线
  List,           // 列表
  ListOrdered,    // 有序列表
  AlignLeft,      // 左对齐
  AlignCenter,    // 居中对齐
  AlignRight,     // 右对齐
  Image,          // 图片
  Code,           // 代码

  // 时间相关
  Calendar,       // 📅 日历
  CalendarDays,   // 日期
  Timer,          // 计时器

  // 其他常用
  Star,           // ⭐ 星标
  Heart,          // ❤️ 收藏
  Bell,           // 🔔 通知
  BellOff,        // 通知关闭
  Share2,         // 分享
  Printer,        // 🖨️ 打印
  Award,          // 🏆 奖项
  Flag,           // 🚩 标记
  Bookmark,       // 书签

  // Lucide Icons 类型
  type LucideIcon,
} from 'lucide-react';

/**
 * 图标尺寸枚举
 */
export const IconSize = {
  sm: 16,      // 列表、次要操作
  base: 20,    // 导航、按钮（默认）
  lg: 24,      // 标题、主要操作
  xl: 32,      // 超大图标
} as const;

/**
 * 图标线宽枚举
 */
export const IconStrokeWidth = {
  normal: 2,    // 默认线宽
  bold: 2.5,    // 强调线宽
} as const;

/**
 * 图标颜色枚举（使用 CSS 变量）
 */
export const IconColor = {
  default: '#737373',    // 默认灰色
  primary: '#0437F2',    // 主色（激活态）
  disabled: '#D4D4D4',   // 禁用灰色
  success: '#059669',    // 成功绿色
  warning: '#D97706',    // 警告琥珀色
  error: '#DC2626',      // 错误红色
} as const;

/**
 * 图标映射对象
 * 用于快速查找和替换 emoji
 */
export const Icons = {
  // 核心功能
  ProposalManagement: FileText,
  DataAnalysis: BarChart3,
  Library: BookOpen,
  Settings: Settings,
  Home: Home,

  // 操作
  Add: Plus,
  Edit: Edit3,
  Delete: Trash2,
  Save: Save,
  Download: Download,
  Upload: Upload,
  View: Eye,
  Hide: EyeOff,
  Search: Search,
  Filter: Filter,
  Refresh: RefreshCw,
  Copy: Copy,
  Confirm: Check,
  Close: X,

  // 状态
  Completed: CheckCircle2,
  InProgress: Clock,
  Warning: AlertCircle,
  Error: XCircle,
  Info: Info,
  Help: HelpCircle,

  // AI功能
  AI: Sparkles,
  Suggestion: Lightbulb,
  QuickAction: Zap,
  TrendUp: TrendingUp,
  Target: Target,

  // 导航
  ChevronLeft: ChevronLeft,
  ChevronRight: ChevronRight,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  Menu: Menu,
  MoreVertical: MoreVertical,
  MoreHorizontal: MoreHorizontal,

  // 用户
  User: User,
  Users: Users,
  Login: LogIn,
  Logout: LogOut,
  Register: UserPlus,
  Lock: Lock,
  Unlock: Unlock,
  Email: Mail,
  Phone: Phone,

  // 文档
  File: File,
  FileCheck: FileCheck,
  FilePlus: FilePlus,
  Folder: Folder,
  FolderOpen: FolderOpen,
  Link: Link2,
  ExternalLink: ExternalLink,

  // 编辑器
  Bold: Bold,
  Italic: Italic,
  Underline: Underline,
  List: List,
  OrderedList: ListOrdered,
  AlignLeft: AlignLeft,
  AlignCenter: AlignCenter,
  AlignRight: AlignRight,
  Image: Image,
  Code: Code,

  // 时间
  Calendar: Calendar,
  Date: CalendarDays,
  Timer: Timer,

  // 其他
  Star: Star,
  Heart: Heart,
  Bell: Bell,
  BellOff: BellOff,
  Share: Share2,
  Print: Printer,
  Award: Award,
  Flag: Flag,
  Bookmark: Bookmark,
} as const;

/**
 * 图标组件通用 Props
 */
export interface IconProps {
  size?: keyof typeof IconSize | number;
  color?: keyof typeof IconColor | string;
  strokeWidth?: keyof typeof IconStrokeWidth | number;
  className?: string;
}

/**
 * 获取图标尺寸数值
 */
export const getIconSize = (size?: IconProps['size']): number => {
  if (typeof size === 'number') return size;
  if (size && size in IconSize) return IconSize[size as keyof typeof IconSize];
  return IconSize.base;
};

/**
 * 获取图标颜色值
 */
export const getIconColor = (color?: IconProps['color']): string => {
  if (!color) return IconColor.default;
  if (color in IconColor) return IconColor[color as keyof typeof IconColor];
  return color;
};

/**
 * 获取图标线宽值
 */
export const getIconStrokeWidth = (strokeWidth?: IconProps['strokeWidth']): number => {
  if (typeof strokeWidth === 'number') return strokeWidth;
  if (strokeWidth && strokeWidth in IconStrokeWidth) {
    return IconStrokeWidth[strokeWidth as keyof typeof IconStrokeWidth];
  }
  return IconStrokeWidth.normal;
};

/**
 * 图标包装组件
 * 统一处理图标的尺寸、颜色、线宽
 *
 * @example
 * ```tsx
 * import { Icon, Icons } from '@/components/icons';
 *
 * // 使用默认配置
 * <Icon icon={Icons.ProposalManagement} />
 *
 * // 自定义尺寸和颜色
 * <Icon
 *   icon={Icons.AI}
 *   size="lg"
 *   color="primary"
 *   strokeWidth="bold"
 * />
 *
 * // 使用数值
 * <Icon icon={Icons.Add} size={24} color="#0437F2" strokeWidth={2.5} />
 * ```
 */
export const Icon: React.FC<IconProps & { icon: LucideIcon }> = ({
  icon: IconComponent,
  size,
  color,
  strokeWidth,
  className,
}) => {
  return (
    <IconComponent
      size={getIconSize(size)}
      color={getIconColor(color)}
      strokeWidth={getIconStrokeWidth(strokeWidth)}
      className={className}
    />
  );
};

/**
 * 导出所有图标以供直接使用
 */
export {
  // 核心功能
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  Home,

  // 操作
  Plus,
  Edit3,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  X,

  // 状态
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  HelpCircle,

  // AI功能
  Sparkles,
  Lightbulb,
  Zap,
  TrendingUp,
  Target,

  // 导航
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  MoreVertical,
  MoreHorizontal,

  // 用户
  User,
  Users,
  LogIn,
  LogOut,
  UserPlus,
  Lock,
  Unlock,
  Mail,
  Phone,

  // 文档
  File,
  FileCheck,
  FilePlus,
  Folder,
  FolderOpen,
  Link2,
  ExternalLink,

  // 编辑器
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Code,

  // 时间
  Calendar,
  CalendarDays,
  Timer,

  // 其他
  Star,
  Heart,
  Bell,
  BellOff,
  Share2,
  Printer,
  Award,
  Flag,
  Bookmark,

  // 类型
  type LucideIcon,
};

export default Icons;
