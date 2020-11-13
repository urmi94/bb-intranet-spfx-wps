require("fabric");
declare var fabric:any;

export default class AnnouncementDetailsDialog{  
    public html: any;
    
    public render(): void { 
      
        const dialogDiv: Element = document.querySelector('#bbAnnouncementDetail');
        dialogDiv.innerHTML = this.html;

        //Create and open dialog
        var dialogComponent = new fabric['Dialog'](dialogDiv);
        dialogComponent.open();
    }
}