import './css/index.css'

import Observable from './util/Observable';
import Draggable from './util/Draggable';

export default class Renderer extends Observable {
    private nodes: any;
    private container: HTMLElement;
    private option: any;
    private key: any;

    constructor(nodes: any, container: HTMLElement, renderOption: any, key: any) {
        super(["change"]);

        this.nodes = nodes;
        this.container = container;
        this.option = renderOption;
        this.key = key;

        this.render();
    }

    render() {
        this.removeLayerList();
        this.renderNodes(this.nodes, this.container);
        this.initDraggable(this.nodes);
    }

    renderNodes(nodes: any, parentElm: HTMLElement | null) {
        let nodesHTML = document.createElement("div");
        if (parentElm == null) return;

        parentElm.appendChild(nodesHTML);

        nodes.forEach((node: any) => {
            let layerList =
                `
                    <ul class="layerList draggable" id="`+ node.id + `" draggable="true">
                        <div class="node">
                            <div class="node-area` + this.getNodeTitleStyleCls(node.level) + `">
                                <div class="node-title">
                                    <input class="nodeCheckBox" type="checkbox" `+ (node.checked ? "checked=true" : "") + `">
                                    <span class="nodeTitleSpan">` + node.name + `</span>
                                </div>
                                <div class="node-btn">
                                    <button class="expendedToggleBtn` + this.getExpendedToggleBtnStyleCls(node[this.key.expended], node.level) + this.getChildNodesStyleCls(!node[this.key.leaf]) + `">
                                        e
                                    </button>
                                    <button class="visibleToggleBtn` + this.getVisibleToggleBtnStyleCls(node[this.key.visible], node.level) + `">
                                        v
                                    </button>
                                </div>
                            </div>
                            <div class="childNodes` + this.getChildNodesStyleCls(node[this.key.expended]) + `" id="childNodesIn` + node[this.key.id] + `">
                                
                            </div>
                        </div>
                    </ul>
                `;

            let DomParser = new DOMParser();
            let tmpDom = DomParser.parseFromString(layerList, "text/html");
            let layerListElm = tmpDom.getElementsByTagName("body")[0].firstChild as HTMLElement;

            let nodeTitleElm = layerListElm.getElementsByClassName("node-title")[0] as HTMLElement;
            nodeTitleElm.onclick = ((e) => this.handleClickNodeTitle(node));

            let expendedToggleBtnElm = layerListElm.getElementsByClassName("expendedToggleBtn")[0] as HTMLElement;
            expendedToggleBtnElm.onclick = ((e) => this.handleClickExpendedToggleBtn(node));

            let visibleToggleBtnElm = layerListElm.getElementsByClassName("visibleToggleBtn")[0] as HTMLElement;
            visibleToggleBtnElm.onclick = ((e) => this.handleClickVisibleToggleBtn(node));

            if (!node[this.key.leaf]) {
                let childNodesElm = layerListElm.getElementsByClassName("childNodes")[0] as HTMLElement;
                this.renderNodes(node.childNodes, childNodesElm);
            }

            nodesHTML.appendChild(layerListElm);
        });

    }
    removeLayerList() {
        if (this.container != null)
            this.container.innerHTML = "";
    }

    initDraggable(nodes: any) {
        let draggable = new Draggable(nodes);
        draggable.on("change", (e: any) => this.handleChangeDraggableList(e));

        nodes.forEach((node: any) => {
            if (!node.leaf) {
                this.initDraggable(node.childNodes);
            }
        });
    }

    getNodeTitleStyleCls(level: number) {
        let nodeTitleClsList = this.option.nodeTitleClsList;
        if (nodeTitleClsList.length < level) // 자신의 level의 Cls값이 없으면, 가장 가까운 상위 level의 Cls값으로 셋팅
            return " " + nodeTitleClsList[nodeTitleClsList.length - 1] + " ";
        else // 자신의 level의 Cls값이 존재하면
            return " " + nodeTitleClsList[level - 1] + " ";
    }

    getChildNodesStyleCls(expended: boolean) {
        return expended ? " " : " hide ";
    }

    getExpendedToggleBtnStyleCls(expended: boolean, level: number) {
        let expendedBtnClsList = expended ? this.option.expendedOnBtnClsList : this.option.expendedOffBtnClsList;
        if (expendedBtnClsList.length < level)
            return " " + expendedBtnClsList[expendedBtnClsList.length - 1] + " ";
        else
            return " " + expendedBtnClsList[level - 1] + " ";
    }

    getVisibleToggleBtnStyleCls(visible: boolean, level: number) {
        let visibleBtnClsList = visible ? this.option.visibleOnBtnClsList : this.option.visibleOffBtnClsList;
        if (visibleBtnClsList.length < level)
            return " " + visibleBtnClsList[visibleBtnClsList.length - 1] + " ";
        else
            return " " + visibleBtnClsList[level - 1] + " ";
    }

    handleClickNodeTitle(node: any) {
        node.checked = !node.checked;
        let event = {
            type: "checked",
            value: node
        }
        this.notify("change", event);
    }

    handleClickExpendedToggleBtn(node: any) {
        node.expended = !node.expended;
        let event = {
            type: "expended",
            value: node
        }
        this.notify("change", event);
    }

    handleClickVisibleToggleBtn(node: any) {
        node.visible = !node.visible;
        let event = {
            type: "visible",
            value: node
        }
        this.notify("change", event);
    }

    handleChangeDraggableList(event: any) {
        this.notify("change", event);
    }
}