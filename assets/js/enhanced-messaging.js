@@ .. @@
 /**
- * Enhanced Messaging System JavaScript
- * Supports text, images, GIFs, links, and stickers with real-time updates
+ * Enhanced Messaging System with WebSocket Integration
+ * Replaces polling with real-time WebSocket communication
  */

-// Global variables
-let messagePollingInterval = null;
-let lastMessageTimestamp = 0;
-let isTyping = false;
-let typingTimeout = null;
-let currentChatId = null;
-let messageQueue = [];
-
-// Initialize when DOM is loaded
-document.addEventListener('DOMContentLoaded', function() {
-    initializeEnhancedMessaging();
-});
-
-/**
- * Initialize enhanced messaging functionality
- */
-function initializeEnhancedMessaging() {
-    initializeMessageForm();
-    initializeFileUpload();
-    initializeTypingIndicators();
-    initializeLinkPreviews();
-    initializeEmojiPicker();
-    initializeRealTimeUpdates();
-    
-    // Get current chat ID if on message page
-    const urlParams = new URLSearchParams(window.location.search);
-    currentChatId = urlParams.get('chat_id');
-    
-    if (currentChatId) {
-        startMessagePolling();
-    }
-}
+// Enhanced messaging with WebSocket integration
+class EnhancedMessaging {
+    constructor(webSocket) {
+        this.ws = webSocket;
+        this.currentChatId = null;
+        this.typingTimeout = null;
+        this.isTyping = false;
+        
+        this.init();
+    }
+    
+    init() {
+        this.initializeMessageForm();
+        this.initializeFileUpload();
+        this.initializeTypingIndicators();
+        this.initializeLinkPreviews();
+        this.initializeEmojiPicker();
+        
+        // Get current chat ID
+        const urlParams = new URLSearchParams(window.location.search);
+        this.currentChatId = urlParams.get('chat_id');
+        
+        if (this.currentChatId && this.ws) {
+            this.ws.joinChat(this.currentChatId);
+        }
+    }