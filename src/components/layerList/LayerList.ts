import Renderer from "./Renderer";
import Observable from "./util/Observable";

export default class LayerList extends Observable {
    private nodes: any | null = null;
    private container: HTMLElement | null = null;
    private renderOption: any | null = null;
    private key = {
        id: "id",
        name: "name",
        checked: "checked",
        expended: "String",
        visible: "visible",
        leaf: "leaf",
        childNodes: "childNodes",
    }

    private renderer: Renderer | null = null;

    constructor(container: HTMLElement | string, initOption: any) {
        super();

        if (typeof container == typeof "string") {
            let elm = document.getElementById(container as string);
            if (elm == null) {
                console.log("ERROR! LayerList init error : container is not exist");
                return;
            }
            container = elm;
        }
        this.container = container as HTMLElement;

        this.nodes = initOption.nodes;
        this.renderOption = initOption.renderOption;

        this.initLayerListOptions(this.renderOption);
        this.initKeyName(this.renderOption.keyNameDefs);
        this.initNodes(this.nodes);

        if (this.nodes != null) {
            this.renderer = this.createRemderer();
            this.renderer.on("change", (e: any) => this.handleChangeLayerList(e));
        }
    }

    createRemderer() {
        return new Renderer(this.nodes, this.container as HTMLElement, this.renderOption, this.key);
    }

    reRendering() {
        this.initNodes(this.nodes);
        this.renderer?.render();
    }

    initLayerListOptions(renderOption: any) {
        if ([undefined, null].includes(renderOption.nodeTitleClsList) || renderOption.nodeTitleClsList.length == 0) {
            renderOption.nodeTitleClsList = ["default-node-title-cls"];
        }
        if ([undefined, null].includes(renderOption.expendedOnBtnClsList) || renderOption.expendedOnBtnClsList.length == 0) {
            renderOption.expendedOnBtnClsList = ["default-expended-on-btn-cls"];
        }
        if ([undefined, null].includes(renderOption.expendedOffBtnClsList) || renderOption.expendedOffBtnClsList.length == 0) {
            renderOption.expendedOffBtnClsList = ["default-expended-off-btn-cls"];
        }
        if ([undefined, null].includes(renderOption.visibleOnBtnClsList) || renderOption.visibleOnBtnClsList.length == 0) {
            renderOption.visibleOnBtnClsList = ["default-visible-on-btn-cls"];
        }
        if ([undefined, null].includes(renderOption.visibleOffBtnClsList) || renderOption.visibleOffBtnClsList.length == 0) {
            renderOption.visibleOffBtnClsList = ["default-visible-off-btn-cls"];
        }
        if ([undefined, null].includes(renderOption.keyNameDefs) || renderOption.keyNameDefs.length == 0) {
            renderOption.keyNameDefs = [
                { keyName: "id", defKeyName: "id" },
                { keyName: "name", defKeyName: "name" },
                { keyName: "checked", defKeyName: "checked" },
                { keyName: "visible", defKeyName: "visible" },
                { keyName: "leaf", defKeyName: "leaf" },
                { keyName: "expended", defKeyName: "expended" },
                { keyName: "childNodes", defKeyName: "childNodes" },
            ]
        }
    }

    initKeyName(keyNameDefs: any) {
        keyNameDefs.forEach((item: any) => {
            switch (item.keyName) {
                case "id":
                    this.key.id = item.defKeyName; break;
                case "name":
                    this.key.name = item.defKeyName; break;
                case "checked":
                    this.key.checked = item.defKeyName; break;
                case "visible":
                    this.key.visible = item.defKeyName; break;
                case "leaf":
                    this.key.leaf = item.defKeyName; break;
                case "expended":
                    this.key.expended = item.defKeyName; break;
                case "childNodes":
                    this.key.childNodes = item.defKeyName; break;
            }
        });
    }

    initNodes(nodes: any, level = 1) {
        nodes.forEach((node: any) => {
            node[this.key.leaf] = false;
            node.level = level;

            let childNodes = node[this.key.childNodes];
            if ([undefined, null].includes(childNodes) || childNodes.length <= 0) {
                node[this.key.leaf] = true;
            } else {
                this.initNodes(childNodes, level + 1);
            }
        });
    }

    handleChangeLayerList(event: any) {
        switch (event.type) {
            case "checked":
                this.handleChangeChecked(event.value);
                break;
            case "expended":
                this.handleExpendedChecked(event.value);
                break;
            case "visible":
                this.handleVisibleChecked(event.value);
                break;
        }
        this.renderer?.render();
        let e = {
            type: event.type,
            value: this.nodes,
        }
        this.notify("change", e);
    }

    handleChangeChecked(node: any) {
        if (node.leaf) return;
        node.childNodes.forEach((childNode: any) => {
            childNode.checked = node.checked;
            if (!childNode.leaf) {
                this.handleChangeChecked(childNode);
            }
        });
    }

    handleExpendedChecked(node: any) {
        //
    }

    handleVisibleChecked(node: any) {
        if (node.leaf) return;
        node.childNodes.forEach((childNode: any) => {
            childNode.visible = node.visible;
            if (!childNode.leaf) {
                this.handleVisibleChecked(childNode);
            }
        });
    }
}