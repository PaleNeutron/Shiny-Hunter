function UiObject(node, parent) {
    this.node = node;
    this.parent = parent;

}



function refresh() {
    this.windowId = node.getWindowId();
    this.childCount = node.childCount;
    // this.actions = UiObject.actionToString();
    this.boundsInParent = UiObject.wrapRect(node.boundsInParent());
    this.bounds = UiObject.wrapRect(node.bounds());
    this.checkable = node.isCheckabled();
    this.checked = node.isChecked();
    this.focusable = node.isFocusable();
    this.focused = node.isFocused();
    this.visibleToUser = node.isVisibleToUser();
    this.accessibilityFocused = node.isAccessibilityFocused();
    this.selected = node.isSelected();
    this.isClickable = node.isClickable();
    this.isLongClickable = node.isLongClickable();
    this.enabled = node.isEnabled();
    this.password = node.isPassword();
    this.scrollable = node.isScrollable();
    this.importantForAccessibility = node.isImportantForAccessibility();
    this.packageName = String(node.getPackageName());
    this.className = String(node.getClassName());
    this.text = String(node.getText());
    this.desc = String(node.getContentDescription());
    this.id = String(node.getViewIdResourceName());
    this.drawerOrder = String(node.getDrawingOrder());
    this.collectionInfo = UiObject.wrapCollectionInfo(node.getCollectionInfo());
    this.collectionItemInfo = UiObject.wrapCollectionItemInfo(node.getCollectionItemInfo());
    this.rangeInfo = UiObject.wrapRangeInfo(node.getRangeInfo())
}

UiObject.prototype.performAction = function (action, args) {

}

UiObject.prototype.recycle = function () {

}
