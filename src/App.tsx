import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  CheckCircle,
  Clipboard,
  Database,
  Facebook,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface Order {
  id: number;
  name: string;
  fb_link: string;
  tracking_code: string;
  created_at: string;
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const App = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrder, setNewOrder] = useState({
    name: "",
    fbLink: "",
    trackingCode: "",
  });
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: "",
    anonKey: "",
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("supabaseConfig");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setSupabaseConfig(config);
      } catch (error) {
        console.error("Error loading saved config:", error);
      }
    }
  }, []);

  // Initialize Supabase client
  const supabase =
    supabaseConfig.url && supabaseConfig.anonKey
      ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
      : null;

  // 🎯 Supabase Integration - Super Clean & Easy!

  // Load data from Supabase
  const loadFromSupabase = async () => {
    if (!supabase) {
      setErrorMessage("Cần có Supabase URL và Anon Key");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
      setConnectionStatus("connected");
      setLastSyncTime(new Date().toLocaleString());
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      setErrorMessage(
        `Lỗi tải dữ liệu: ${(error as Error)?.message || "Unknown error"}`
      );
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Add order to Supabase
  const addOrderToSupabase = async (order: {
    name: string;
    fb_link: string;
    tracking_code: string;
  }) => {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.from("orders").insert([order]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error adding to Supabase:", error);
      setErrorMessage(
        `Lỗi thêm dữ liệu: ${(error as Error)?.message || "Unknown error"}`
      );
      return false;
    }
  };

  // Delete order from Supabase
  const deleteOrderFromSupabase = async (id: number) => {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting from Supabase:", error);
      setErrorMessage(
        `Lỗi xóa dữ liệu: ${(error as Error)?.message || "Unknown error"}`
      );
      return false;
    }
  };

  // Test connection to Supabase
  const testConnection = async () => {
    if (!supabase) {
      setErrorMessage("Cần có Supabase URL và Anon Key để test kết nối");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      setConnectionStatus("connected");
      setErrorMessage("");

      // Save config to localStorage on successful connection
      localStorage.setItem("supabaseConfig", JSON.stringify(supabaseConfig));

      await loadFromSupabase();
    } catch (error) {
      setErrorMessage(
        `Lỗi kết nối: ${(error as Error)?.message || "Unknown error"}`
      );
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Search function
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFoundOrder(null);
      return;
    }

    const found = orders.find(
      (order) =>
        order?.tracking_code
          ?.toString()
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order?.name
          ?.toString()
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFoundOrder(found || null);
  };

  // Auto-search when searchTerm changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm, orders, handleSearch]);

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSearchTerm(text.trim());
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      setErrorMessage("Không thể đọc clipboard. Vui lòng copy text trước.");
    }
  };

  // Add new order
  const handleAddOrder = async () => {
    if (newOrder.name && newOrder.fbLink && newOrder.trackingCode) {
      const orderToAdd = {
        name: newOrder.name,
        fb_link: newOrder.fbLink,
        tracking_code: newOrder.trackingCode,
      };

      setIsLoading(true);
      const success = await addOrderToSupabase(orderToAdd);
      setIsLoading(false);

      if (success) {
        setConnectionStatus("connected");
        setLastSyncTime(new Date().toLocaleString());
        setNewOrder({ name: "", fbLink: "", trackingCode: "" });
        // Reload data to get the new order with ID
        await loadFromSupabase();
      } else {
        setConnectionStatus("error");
      }
    }
  };

  // Delete order
  const handleDeleteOrder = async (id: number) => {
    setIsLoading(true);
    const success = await deleteOrderFromSupabase(id);
    setIsLoading(false);

    if (success) {
      setConnectionStatus("connected");
      setLastSyncTime(new Date().toLocaleString());
      // Reload data to reflect changes
      await loadFromSupabase();

      if (foundOrder && foundOrder.id === id) {
        setFoundOrder(null);
      }
    } else {
      setConnectionStatus("error");
    }
  };

  // Quick delete by tracking code
  const handleQuickDelete = async () => {
    if (foundOrder) {
      await handleDeleteOrder(foundOrder.id);
      setSearchTerm("");
    }
  };

  // Auto-connect when config is available
  useEffect(() => {
    if (supabase && supabaseConfig.url && supabaseConfig.anonKey) {
      // Auto-connect if we have credentials
      const autoConnect = async () => {
        try {
          const { error } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true });

          if (error) {
            throw error;
          }

          setConnectionStatus("connected");
          setLastSyncTime(new Date().toLocaleString());
          await loadFromSupabase();
        } catch (error) {
          console.error("Auto-connect failed:", error);
          setConnectionStatus("error");
          setErrorMessage(
            `Kết nối tự động thất bại: ${
              (error as Error)?.message || "Unknown error"
            }`
          );
        }
      };

      autoConnect();
    } else {
      setConnectionStatus("needsSetup");
    }
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="text-green-500" size={20} />;
      case "needsSetup":
        return <Settings className="text-orange-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Database className="text-purple-500" size={20} />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Đã kết nối Supabase";
      case "needsSetup":
        return supabaseConfig.url || supabaseConfig.anonKey
          ? "Cần nhập đầy đủ thông tin"
          : "Cần setup Supabase";
      case "error":
        return "Lỗi kết nối Supabase";
      default:
        return "Đang kết nối...";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <Package className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            <span className="leading-tight">Quản Lý Đơn Hàng</span>
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto"
          >
            <Settings size={14} className="sm:w-4 sm:h-4" />
            Cài Đặt
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {getStatusIcon()}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  {getStatusText()}
                </span>
                {lastSyncTime && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    Cập nhật: {lastSyncTime}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={testConnection}
                disabled={
                  !supabaseConfig.url || !supabaseConfig.anonKey || isLoading
                }
                className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base justify-center"
              >
                <Zap size={14} className="sm:w-4 sm:h-4" />
                {isLoading ? "Đang test..." : "Test kết nối"}
              </button>
              <button
                onClick={loadFromSupabase}
                disabled={
                  !supabaseConfig.url || !supabaseConfig.anonKey || isLoading
                }
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base justify-center"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                {isLoading ? "Đang tải..." : "Tải lại"}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {showSettings && (
          <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-purple-800 mb-4">
              🚀 Thiết Lập Supabase (Siêu Dễ!):
            </h3>

            {/* Setup Steps */}
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase URL:
                </label>
                <input
                  type="text"
                  value={supabaseConfig.url}
                  onChange={(e) => {
                    const newConfig = {
                      ...supabaseConfig,
                      url: e.target.value,
                    };
                    setSupabaseConfig(newConfig);
                    // Save to localStorage immediately
                    localStorage.setItem(
                      "supabaseConfig",
                      JSON.stringify(newConfig)
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://xxxxx.supabase.co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase Anon Key (safe for frontend):
                </label>
                <input
                  type="text"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => {
                    const newConfig = {
                      ...supabaseConfig,
                      anonKey: e.target.value,
                    };
                    setSupabaseConfig(newConfig);
                    // Save to localStorage immediately
                    localStorage.setItem(
                      "supabaseConfig",
                      JSON.stringify(newConfig)
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2 mt-4">
              {(supabaseConfig.url || supabaseConfig.anonKey) && (
                <button
                  onClick={() => {
                    localStorage.removeItem("supabaseConfig");
                    setSupabaseConfig({ url: "", anonKey: "" });
                    setConnectionStatus("needsSetup");
                    setOrders([]);
                    setErrorMessage("");
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  Xóa Config
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-300 p-4 rounded-lg mb-6 text-red-800">
            <strong>Lỗi:</strong> {errorMessage}
          </div>
        )}

        {/* Search Section */}
        <div className="bg-green-50 p-3 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
            <Search className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
            Tìm Kiếm Đơn Hàng
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
            <input
              type="text"
              placeholder="Nhập mã vận đơn hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <button
              onClick={handlePasteFromClipboard}
              className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Clipboard size={14} className="sm:w-4 sm:h-4" />
              Paste
            </button>
          </div>

          {/* Search Result */}
          {foundOrder && (
            <div className="bg-yellow-100 border border-yellow-300 p-3 sm:p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 text-sm sm:text-base mb-2">
                    🎯 Tìm Thấy Đơn Hàng:
                  </h3>
                  <div className="space-y-1 text-sm sm:text-base">
                    <p>
                      <strong>Tên:</strong> {foundOrder.name}
                    </p>
                    <p className="break-all">
                      <strong>Facebook:</strong> {foundOrder.fb_link}
                    </p>
                    <p>
                      <strong>Mã vận đơn:</strong> {foundOrder.tracking_code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleQuickDelete}
                  className="px-3 py-2 h-fit sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 justify-center text-sm sm:text-base self-start sm:self-auto"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Hàng Đã Về - Xóa</span>
                  <span className="sm:hidden">Xóa</span>
                </button>
              </div>
            </div>
          )}

          {searchTerm && !foundOrder && (
            <div className="bg-gray-100 border border-gray-300 p-3 sm:p-4 rounded-lg text-gray-800 text-sm sm:text-base">
              Không tìm thấy đơn hàng nào với từ khóa "{searchTerm}"
            </div>
          )}
        </div>

        {/* Add New Order Section */}
        <div className="bg-blue-50 p-3 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
            <Plus className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
            Thêm Đơn Hàng Mới
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={newOrder.name}
              onChange={(e) =>
                setNewOrder({ ...newOrder, name: e.target.value })
              }
              className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="Link Facebook"
              value={newOrder.fbLink}
              onChange={(e) =>
                setNewOrder({ ...newOrder, fbLink: e.target.value })
              }
              className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="Mã vận đơn"
              value={newOrder.trackingCode}
              onChange={(e) =>
                setNewOrder({ ...newOrder, trackingCode: e.target.value })
              }
              className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <button
              onClick={handleAddOrder}
              disabled={
                !newOrder.name ||
                !newOrder.fbLink ||
                !newOrder.trackingCode ||
                isLoading
              }
              className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 justify-center text-sm sm:text-base sm:col-span-2 lg:col-span-1"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              {isLoading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border-b border-gray-200 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-2">
              <User className="text-gray-600 w-5 h-5 sm:w-6 sm:h-6" />
              Danh Sách Đơn Hàng ({orders.length} đơn)
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-4 sm:p-8 text-center text-gray-500">
              <Package
                size={40}
                className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300"
              />
              <p className="text-base sm:text-lg mb-2">Chưa có đơn hàng nào</p>
              <div className="space-y-2 text-sm">
                {!supabaseConfig.url || !supabaseConfig.anonKey ? (
                  <p>Thiết lập Supabase để bắt đầu</p>
                ) : (
                  <p>Đã thiết lập Supabase</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="sm:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <span className="font-medium text-gray-900 text-sm">
                            {order.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={isLoading}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1 text-xs"
                        >
                          <Trash2 size={12} />
                          Xóa
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-500">
                            Facebook:
                          </span>
                          <a
                            className="ml-2 text-blue-600 break-all"
                            href={order.fb_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {order.fb_link}
                          </a>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-500">
                              Mã vận đơn:
                            </span>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {order.tracking_code}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên Khách Hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link Facebook
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã Vận Đơn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày Tạo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900 text-sm">
                              {order.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Facebook size={16} className="text-blue-600" />
                            <a
                              className="text-gray-600 text-sm hover:text-blue-600"
                              href={order.fb_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {order.fb_link.length > 20
                                ? order.fb_link.substring(0, 20) + "..."
                                : order.fb_link}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {order.tracking_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={isLoading}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1 text-xs"
                          >
                            <Trash2 size={12} />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-4 sm:mt-6 bg-gray-100 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
            📋 Quy Trình Sử Dụng:
          </h3>
          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
            <p>
              <strong>1.</strong> 🔧 Setup Supabase một lần
            </p>
            <p>
              <strong>2.</strong> 📥 Tải dữ liệu từ Supabase
            </p>
            <p>
              <strong>3.</strong> 📱 Copy mã vận đơn → Paste → Xóa
            </p>
            <p>
              <strong>4.</strong> ➕ Thêm đơn hàng mới
            </p>
            <p>
              <strong>🎯 Perfect cho GitHub Pages!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
