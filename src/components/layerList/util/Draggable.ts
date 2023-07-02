import Observable from "./Observable";
//////////
export default class Draggable extends Observable {
    list: Array<any>
    constructor(list: Array<any>) {
        let events = ["change"];
        super(events);

        this.list = list;

        this.initIdListForDraggable();
    }

    initIdListForDraggable() {
        this.list.forEach(item => {
            let elm = document.getElementById(item.id);
            if (elm == null) return;
            elm.setAttribute("draggable", "true");
            elm.classList.add("draggable");
            elm.ondragstart = (e) => this.handleDragStart(e);
            elm.ondragover = (e) => this.handleDragOver(e);
            elm.ondragenter = (e) => this.handleDragEnter(e);
            elm.ondragleave = (e) => this.handleDragLeave(e);
            elm.ondragend = (e) => this.handleDragEnd(e);
            elm.ondrop = (e) => this.handleDrop(e);
        });
    }

    handleDragStart(e: any) {
        e.dataTransfer.setData("text", e.target.id);
    }
    handleDragOver(e: any) {
        if (e.preventDefault) {
            e.preventDefault();
        }
    }
    handleDragEnter(e: any) {

    }
    handleDragLeave(e: any) {

    }
    handleDragEnd(e: any) {

    }
    handleDrop(e: any) {
        e.stopPropagation(); // stops the browser from redirecting.
        let target = e.target;
        let selected = e.dataTransfer.getData("text");
        selected = document.getElementById(selected);

        let idList = this.list.map(item => item.id);

        // s > t : t.parentNode
        // s < t : return;
        let flag = false;
        if (idList.includes(selected.id)) { // selected가 target과 같은 draggable 그룹에 속하는가?
            flag = true;
        } else {
            selected.ondrop(e);
        }
        if (!flag) return;
        flag = false;
        for (; ;) {
            if (idList.includes(target.id)) {
                flag = true;
                break;
            }
            target = target.parentNode;
            if (target === document.getElementsByTagName("body")[0])
                break;
        }
        if (!flag) return;

        let selectedItem = this.list.find(item => item.id == selected.id);
        let targetItem = this.list.find(item => item.id == target.id);
        let selectedIdx = this.list.indexOf(selectedItem);
        let targetIdx = this.list.indexOf(targetItem);
        this.list.splice(selectedIdx, 1);
        this.list.splice(targetIdx, 0, selectedItem);

        if (targetIdx == this.list.length - 1) {
            target.parentNode.insertBefore(selected, null);
        } else if (selectedIdx < targetIdx) {
            target = document.getElementById(this.list[targetIdx + 1].id);
            target.parentNode.insertBefore(selected, target);
        } else {
            target.parentNode.insertBefore(selected, target);
        }
        this.updateList();
    }

    updateList() {
        let event = {
            type: "dragdrop",
            value: this.list,
        }
        this.notify("change", event);
    }
}