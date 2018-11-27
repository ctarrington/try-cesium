export class ButtonBar {
    barDiv: HTMLElement;

    constructor() {
        this.barDiv = document.createElement('div');
        this.barDiv.id = 'button-bar';
        document.body.appendChild(this.barDiv);
    }

    addToggle<T>(labels:string[], values: T[], callback:(value:T)=>void) {
        let index = 0;
        const button = document.createElement('button');
        button.value = '0';
        button.innerText = labels[0];

        button.onclick = () => {
            index++;
            if (index == labels.length) {
                index = 0;
            }

            button.innerText = labels[index];
            callback(values[index]);
        };


        this.barDiv.appendChild(button);
    }

    addButton(label:string, callback:()=>void) {
        const button = document.createElement('button');
        button.value = '0';
        button.innerText = label;

        button.onclick = () => {
            callback();
        };
        this.barDiv.appendChild(button);
    }

}