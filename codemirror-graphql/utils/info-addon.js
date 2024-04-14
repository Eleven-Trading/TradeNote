"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
codemirror_1.default.defineOption('info', false, function (cm, options, old) {
    if (old && old !== codemirror_1.default.Init) {
        var oldOnMouseOver = cm.state.info.onMouseOver;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseover', oldOnMouseOver);
        clearTimeout(cm.state.info.hoverTimeout);
        delete cm.state.info;
    }
    if (options) {
        var state = (cm.state.info = createState(options));
        state.onMouseOver = onMouseOver.bind(null, cm);
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseover', state.onMouseOver);
    }
});
function createState(options) {
    return {
        options: options instanceof Function
            ? { render: options }
            : options === true
                ? {}
                : options,
    };
}
function getHoverTime(cm) {
    var options = cm.state.info.options;
    return (options === null || options === void 0 ? void 0 : options.hoverTime) || 500;
}
function onMouseOver(cm, e) {
    var state = cm.state.info;
    var target = e.target || e.srcElement;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    if (target.nodeName !== 'SPAN' || state.hoverTimeout !== undefined) {
        return;
    }
    var box = target.getBoundingClientRect();
    var onMouseMove = function () {
        clearTimeout(state.hoverTimeout);
        state.hoverTimeout = setTimeout(onHover, hoverTime);
    };
    var onMouseOut = function () {
        codemirror_1.default.off(document, 'mousemove', onMouseMove);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        clearTimeout(state.hoverTimeout);
        state.hoverTimeout = undefined;
    };
    var onHover = function () {
        codemirror_1.default.off(document, 'mousemove', onMouseMove);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        state.hoverTimeout = undefined;
        onMouseHover(cm, box);
    };
    var hoverTime = getHoverTime(cm);
    state.hoverTimeout = setTimeout(onHover, hoverTime);
    codemirror_1.default.on(document, 'mousemove', onMouseMove);
    codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', onMouseOut);
}
function onMouseHover(cm, box) {
    var pos = cm.coordsChar({
        left: (box.left + box.right) / 2,
        top: (box.top + box.bottom) / 2,
    });
    var state = cm.state.info;
    var options = state.options;
    var render = options.render || cm.getHelper(pos, 'info');
    if (render) {
        var token = cm.getTokenAt(pos, true);
        if (token) {
            var info = render(token, options, cm, pos);
            if (info) {
                showPopup(cm, box, info);
            }
        }
    }
}
function showPopup(cm, box, info) {
    var popup = document.createElement('div');
    popup.className = 'CodeMirror-info';
    popup.append(info);
    document.body.append(popup);
    var popupBox = popup.getBoundingClientRect();
    var popupStyle = window.getComputedStyle(popup);
    var popupWidth = popupBox.right -
        popupBox.left +
        parseFloat(popupStyle.marginLeft) +
        parseFloat(popupStyle.marginRight);
    var popupHeight = popupBox.bottom -
        popupBox.top +
        parseFloat(popupStyle.marginTop) +
        parseFloat(popupStyle.marginBottom);
    var topPos = box.bottom;
    if (popupHeight > window.innerHeight - box.bottom - 15 &&
        box.top > window.innerHeight - box.bottom) {
        topPos = box.top - popupHeight;
    }
    if (topPos < 0) {
        topPos = box.bottom;
    }
    var leftPos = Math.max(0, window.innerWidth - popupWidth - 15);
    if (leftPos > box.left) {
        leftPos = box.left;
    }
    popup.style.opacity = '1';
    popup.style.top = topPos + 'px';
    popup.style.left = leftPos + 'px';
    var popupTimeout;
    var onMouseOverPopup = function () {
        clearTimeout(popupTimeout);
    };
    var onMouseOut = function () {
        clearTimeout(popupTimeout);
        popupTimeout = setTimeout(hidePopup, 200);
    };
    var hidePopup = function () {
        codemirror_1.default.off(popup, 'mouseover', onMouseOverPopup);
        codemirror_1.default.off(popup, 'mouseout', onMouseOut);
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', onMouseOut);
        if (popup.style.opacity) {
            popup.style.opacity = '0';
            setTimeout(function () {
                if (popup.parentNode) {
                    popup.remove();
                }
            }, 600);
        }
        else if (popup.parentNode) {
            popup.remove();
        }
    };
    codemirror_1.default.on(popup, 'mouseover', onMouseOverPopup);
    codemirror_1.default.on(popup, 'mouseout', onMouseOut);
    codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', onMouseOut);
}
//# sourceMappingURL=info-addon.js.map