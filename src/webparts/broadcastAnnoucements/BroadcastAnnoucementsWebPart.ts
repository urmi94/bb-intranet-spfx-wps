import { Version } from '@microsoft/sp-core-library';
import {  IPropertyPaneConfiguration,  PropertyPaneTextField} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './BroadcastAnnoucementsWebPart.module.scss';
import {  SPHttpClient, SPHttpClientResponse} from '@microsoft/sp-http';  
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as moment from 'moment';
import * as $ from 'jquery';
require('Bluebox.Util');
require('Bluebox.Constants');
require('Bluebox.Loader');
require('Bluebox.Broadcast');
// require('moment');

import AnnouncementDetailsDialog from './AnnouncementDetailsDialog';
import AnnouncementListDialog from './AnnouncementListDialog';

declare var jQuery:any;
declare var Bluebox:any;

var option: any = {
  HtmlId: "bbBroadcast"
};

export interface IBroadcastAnnouncementsWebPartProps {
  description: string;
}

export interface ISPList {
  value: ISPListItem[];
}

export interface ISPListItem {
  Id: string;
  Title: string;
  Body: string;
  BBXCategoryStyle: {
    BBXCatStyleColour: string;
    Title: string;
    BBXCatStyleImage: string;
  };
  Editor: {
    Title: string;
  };
  BroadcastPublishedDate: string;
}

export default class BroadcastAnnouncementsWebPart extends BaseClientSideWebPart<IBroadcastAnnouncementsWebPartProps>  {
  
  protected onInit(): Promise<void> {
    var page = this.context.pageContext.legacyPageContext;
    window["_spPageContextInfo"] = page;

    return super.onInit();
  }
  
   private _getListData(): Promise<ISPList> {
    
    let currentWebUrl = this.context.pageContext.web.absoluteUrl; 
    let requestUrl = currentWebUrl.concat("/_api/web/Lists/GetByTitle('Broadcast Announcements')/items?$select=ID,Title,Body,Editor/Title,BroadcastPublishedDate,BBXCategoryStyle/Title,BBXCategoryStyle/BBXCatStyleImage,BBXCategoryStyle/BBXCatStyleColour&$expand=BBXCategoryStyle,Editor");
  
    return this.context.spHttpClient.get(requestUrl, SPHttpClient.configurations.v1) 
      .then((response: SPHttpClientResponse) => {
        
        return response.json();
      });
  }

  public showAnnouncementDetails(item): void { 
    const dialog: AnnouncementDetailsDialog = new AnnouncementDetailsDialog(); 
    item = JSON.parse(unescape(item));
    dialog.html = Bluebox.Broadcast2.ShowModernBroadcastDetailsPopup(item);
    dialog.render(); 
  }

  private _showAnnouncementList(data, renderItemsHtml): void { 

    const dialog: AnnouncementListDialog = new AnnouncementListDialog(); 
    dialog.data = data; 
    dialog.renderItemsHtml = renderItemsHtml;     
    dialog.render(); 
  }

  public render(): void { 
    
    this.domElement.innerHTML = `    
      <div class="${ styles.broadcastAnnouncements }">
        <div class="${ styles.container }">
          <div id="bbBroadcast"></div>       
        </div>
        <div class="${ styles.container }">
          <div id="bbAnnouncementList" class="ms-Dialog ms-Dialog--close ms-Dialog--blocking" style="max-width: max-content !important;">          
          </div>
        </div>
        <div class="${ styles.container }">
          <div id="bbAnnouncementDetail" class="ms-Dialog ms-Dialog--close ms-Dialog--blocking" style="width: 600px; max-width: none !important;">
          </div>
        </div>        
      </div>`;

    var option: any = {
      HtmlId: "bbBroadcast",
      Source: "modern"
    };
    //Loading Fabric JS - CSS
    SPComponentLoader.loadCss('https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.4.0/css/fabric.components.min.css');
    SPComponentLoader.loadCss('https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.4.0/css/fabric.min.css');
    
    //Loading Bulleting CSS    
    SPComponentLoader.loadCss('https://bbxclientsdevstoragecdn.blob.core.windows.net/urmi-broadcast/bb-webparts/BlueboxBroadcast/Core/webparts/broadcast/broadcast.css');
    SPComponentLoader.loadCss('https://bbxclientsdevstoragecdn.blob.core.windows.net/urmi-broadcast/bb-webparts/BlueboxBulletin/Core/webparts/bulletin/bulletinPopup1.css');

    var checkScriptExist = setInterval(() => {
      if(Bluebox.Constants != "undefined" && Bluebox.Loader != "undefined" && Bluebox.Broadcast2 != "undefined" && jQuery.fn.vTicker != "undefined") {
         Bluebox.Broadcast2.Execute(option);
         clearInterval(checkScriptExist);
      } 
    }, 100);

    //On click dialog
    var self = this;
    let renderItemsHtml = [];
    var checkHTMLExist = setInterval(() => {
      if ($( "[class^='bbBroadcastCount'], [class^='bbBroadcastCountLink'], #bbBroadcast [class^='bbBroadcastSeverity'], #bbBroadcast [class^='bbBroadcastTitle']" ).length) {
        self._getListData()
          .then((response) => {  
            var data = response.value;
            Bluebox.Broadcast2.RenderItems(option, data, renderItemsHtml, true);                   
            $( "[class^='bbBroadcastCount'], [class^='bbBroadcastCountLink']" ).on("click", () => {
                  self._showAnnouncementList(data, renderItemsHtml);        
              });          

          
            $( "#bbBroadcast [class^='bbBroadcastSeverity'], #bbBroadcast [class^='bbBroadcastTitle']" ).each(function(index) {
              $(this).on("click", () => {
                  var spItem = $(this).data('spitem');
                  self.showAnnouncementDetails(spItem);        
              });
            });
          });
          clearInterval(checkHTMLExist);
      }
    }, 100);
          
  }
  
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Broadcast Annoucements Header"
          },
          groups: [
            {
              groupName: "Broadcast Webpart Properties GroupName",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "Property Title Placeholder"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
