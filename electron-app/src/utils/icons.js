import {
    createIcons,
    LayoutDashboard,
    Users,
    Megaphone,
    Mail,
    Zap,
    Sparkles,
    Paperclip,
    FileText,
    MailOpen,
    LogOut,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Image as ImageIcon,
    Send,
    UserPlus,
    X,
    Link,
    Eraser,
    AlertTriangle,
    Copy,
    Eye,
    Upload
} from 'lucide';

/**
 * Initialize all Lucide icons on the page
 * Call this after rendering any component that uses icons
 */
export function initIcons() {
    createIcons({
        icons: {
            LayoutDashboard,
            Users,
            Megaphone,
            Mail,
            Zap,
            Sparkles,
            Paperclip,
            FileText,
            MailOpen,
            LogOut,
            Plus,
            Edit,
            Trash2,
            CheckCircle,
            XCircle,
            ImageIcon,
            Send,
            UserPlus,
            X,
            Link,
            Eraser,
            AlertTriangle,
            Copy,
            Eye,
            Upload
        }
    });
}
