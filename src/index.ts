function createCloneDom(dom: HTMLElement, width?: number): HTMLElement {
    const cloneDom = dom.cloneNode() as HTMLElement;
    const oldStyleStr = cloneDom.getAttribute('style') || '';
    let styleStr = oldStyleStr;
    styleStr += 'position: fixed;';
    styleStr += 'top: 0;';
    styleStr += 'left: 0;';
    styleStr += 'z-index: 1000000;';
    styleStr += 'opacity: 0;';
    styleStr += '-ms-user-select: text;';
    styleStr += '-webkit-user-select: text;';
    styleStr += 'user-select: text;';
    if (typeof width === 'number') {
        styleStr += `width: ${width}px;`;
    } else {
        styleStr += `width: auto;`;
    }

    cloneDom.setAttribute('style', styleStr);

    return cloneDom;
}

interface IPositionInfo {
    start: {
        startContainer: Node;
        startOffset: number;
    };
    end: {
        startContainer: Node;
        startOffset: number;
    };
}

function getPositionInfo(_startX: number, _startY: number, _endX: number, _endY: number): IPositionInfo {
    const startX = _startX + 1;
    const startY = _startY + 1;
    const endX = _endX - 1;
    // safari 外部容器上下回留白一点
    const endY = _endY - 3;

    if (document.caretRangeFromPoint) {
        const start = document.caretRangeFromPoint(startX, startY);
        const end = document.caretRangeFromPoint(endX, endY);
        if (start !== null && end !== null) {
            return {
                start: {
                    startContainer: start.startContainer,
                    startOffset: start.startOffset,
                },
                end: {
                    startContainer: end.startContainer,
                    startOffset: end.startOffset,
                },
            };
        }
    }
    // @ts-ignore: Experimental, 主要兼容 firefox
    else if (document.caretPositionFromPoint) {
        // @ts-ignore: Experimental, 主要兼容 firefox
        const start = document.caretPositionFromPoint(startX, startY);
        // @ts-ignore: Experimental, 主要兼容 firefox
        const end = document.caretPositionFromPoint(endX, endY);
        if (start !== null && end !== null) {
            return {
                start: {
                    startContainer: start.offsetNode,
                    startOffset: start.offset,
                },
                end: {
                    startContainer: end.offsetNode,
                    startOffset: end.offset,
                },
            };
        }
    }

    throw new Error('getPositionInfo has some error!');
}

function getText({ start, end }: IPositionInfo): string {
    const range = document.createRange();
    range.setStart(start.startContainer, start.startOffset);
    range.setEnd(end.startContainer, end.startOffset);
    const result = range.toString();
    range.detach();
    return result;
}

function getFinallyText(dom: HTMLElement, text: string, width: number, height: number, headPlaceHolderDom: HTMLElement | undefined, tailPlaceHolder: number): string {
    let result = text;

    dom.innerHTML = '';
    headPlaceHolderDom && dom.append(headPlaceHolderDom);
    dom.append(text);

    const startX = 0;
    const startY = 0;
    const endX = width - tailPlaceHolder;
    const endY = height;

    const position1 = getPositionInfo(startX, startY, endX, endY);
    const result1 = getText(position1);

    /** NOTE: 这个 caretRangeFromPoint 方法
     *  当 点 在字体右边的时候，也会选取最左边的点作为选中项
     *  通过 '.' 来判断  点 是否在字上
     */
    dom.innerHTML = '';
    headPlaceHolderDom && dom.append(headPlaceHolderDom);
    dom.append(result1 + '.');
    const position2 = getPositionInfo(startX, startY, endX, endY);

    if (position1.end.startOffset === position2.end.startOffset) {
        // 说明 占位的点 在字上
        result = result1.slice(0, -1);
    } else {
        // 说明 占位的点 在字的右边
        result = result1;
    }
    return result;
}

interface IParams {
    dom: HTMLElement;
    text: string;
    /** 
     * @deprecated 
     * 尽快切换到 maxLine
     * 下一个版本会被弃用
     */
    maxHeight?: number;
    /**
     * 最大行数
     * 优先级更高，回覆盖maxHeight
     */
    maxLine?: number; 
    /**
     * 是否使用省略号
     */
    ellipsis?: boolean;
    /**
     * 头部占位空间
     */
    headPlaceHolder?: number;
    /**
     * 尾部占位空间
     */
    tailPlaceHolder?: number;
}

export default function getMultilineText({ dom, text, maxHeight, maxLine, headPlaceHolder = 0, tailPlaceHolder = 0, ellipsis }: IParams): string {
    // NOTE: 部分华为手机富文本编辑的时候，会在头部加入 \ufeff
    const _text = text.replace(/\ufeff/g, '');
    try {
        /** ------ CHECK 传入的值是否符合要求 start ------ */
        const domCssObj = window.getComputedStyle(dom);
        const rect = dom.getBoundingClientRect();

        const lineHeight = Number.parseFloat(domCssObj.getPropertyValue('line-height'));
        if(Number.isNaN(lineHeight)) {
            throw new Error(`传入的DOM请显示明确line-height的高度`);
        }
        
        let _maxHeight;
        if(typeof maxHeight === 'number') {
            _maxHeight = maxHeight;
        }
        if(typeof maxLine === 'number') {
            _maxHeight = maxLine * lineHeight;
        }
        if(!_maxHeight) {
            throw new Error(`maxHeight 或者 maxLine 一定要有一个值，如果你传入的是0，就麻烦你改一改，求求你了`);
        }

        const parentDom = dom.parentElement;
        if (!parentDom) {
            throw new Error(`当前dom无法处理，无父级元素`);
        }

        if (headPlaceHolder > rect.width) {
            throw new Error(`headPlaceHolder(${headPlaceHolder})应该小于dom的宽度(${rect.width})。`);
        }

        if (tailPlaceHolder > rect.width) {
            throw new Error(`tailPlaceHolder(${tailPlaceHolder})应该小于dom的宽度(${rect.width})。`);
        }
        /** ------ CHECK 传入的值是否符合要求 end ------ */

        let result = _text;
        const cloneDom = createCloneDom(dom, rect.width);

        let headPlaceHolderDom;
        if(headPlaceHolder) {
            headPlaceHolderDom = document.createElement('cus-ph-span');
            let styleStr = '';
            styleStr += 'display: inline-block;';
            styleStr += `width: ${headPlaceHolder}px;`;
            headPlaceHolderDom.setAttribute('style', styleStr);
        }

        // NOTE: windows 端有一个问题
        /**
         * [text text text text text text text ]
         * |                           .       |
         * 上面的点代表（endX，endY） 点
         * 这个点 mac浏览器返回的是 全部选中的结果
         * windows 返回的值 只到 text text text text text tex，与我选中全部的本意是不相符合的
         * 需要做一个兼容
         */

        // 需要计算一下是否需要展示 ... 
        // 标准是 当实际渲染的高度 + lineHeight <= maxHeight 
        // 则不需要显示 ...  直接返回就可以
        let oldCloneDomCss = cloneDom.getAttribute('style') || '';
        cloneDom.style.height = 'auto';
        headPlaceHolderDom && cloneDom.append(headPlaceHolderDom);
        cloneDom.append(text);
        parentDom.appendChild(cloneDom);
        const rectWithoutHeight = cloneDom.getBoundingClientRect();
        if(rectWithoutHeight.height + lineHeight <= _maxHeight) {
            parentDom.removeChild(cloneDom);
            return result;
        }

        // 可能存在需要展示 ... 的情况
        oldCloneDomCss += 'bottom: 0;';
        cloneDom.setAttribute('style', oldCloneDomCss);

        result = getFinallyText(cloneDom, _text, rect.width, _maxHeight, headPlaceHolderDom, tailPlaceHolder);

        // 如果文字超长了
        if (ellipsis && result.trim() !== _text.trim()) {
            let ellipsisPlaceHolder: number = 0;
            if (ellipsis) {
                const cloneDom = createCloneDom(dom);
                cloneDom.innerText = '...';
                parentDom.appendChild(cloneDom);
                const rect = cloneDom.getBoundingClientRect();
                ellipsisPlaceHolder = rect.width;
                parentDom.removeChild(cloneDom);
            }

            const tailPlaceHolderWithEllipsis = tailPlaceHolder + ellipsisPlaceHolder;
            if (tailPlaceHolderWithEllipsis > rect.width) {
                throw new Error(
                    `tailPlaceHolder(${tailPlaceHolderWithEllipsis})应该小于dom的宽度(${rect.width})。注意：ellipsis功能也会占用部分宽度。`,
                );
            }

            result = getFinallyText(cloneDom, _text, rect.width, _maxHeight, headPlaceHolderDom, tailPlaceHolderWithEllipsis) + '...';
        }

        parentDom.removeChild(cloneDom);

        return result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('GET_MULTILINE_TEXT - ', error.message);
        } else {
            console.error('GET_MULTILINE_TEXT - ', '未知错误');
        }
        return _text;
    }
}
