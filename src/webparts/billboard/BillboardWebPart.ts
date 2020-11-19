import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneCheckbox,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as $ from 'jquery';
require('Bluebox.Util');
require('Bluebox.Constants');
require('Bluebox.Loader');
require('Bluebox.Billboard');
declare var Bluebox:any;

export interface IBillboardWebPartProps {
  isReqItemLimit: boolean;
  isReqItemDur: boolean;
  itemLimit: number; 
  itemDuration: number; 
}

export default class BillboardWebPart extends BaseClientSideWebPart<IBillboardWebPartProps> {

  protected onInit(): Promise<void> {
    //this.properties.tabModel = hipsterTabsToModel(this.properties.tabs, this.getZones());
    var page = this.context.pageContext.legacyPageContext;
    window["_spPageContextInfo"] = page;
    return super.onInit();
  }

  public render(): void {
    
    var _options = {
      data: {
        subSiteUrl: "",                 //Site subsite url, empty if list is on site collection level.
        listTitle: "Billboard",         //List Title
        category: "Initiative",         //Data Category to display
      },
    
      display: {
        htmlId: 'bb-billboard',         //HTML ID to inject the data, Make sure it matches with the ID at the top.
    
        itemLimit: this.properties.isReqItemLimit ? this.properties.itemLimit : 0,                   //Maximum number of items to display, 0 to set as no limit.
        itemDuration: this.properties.isReqItemDur ? this.properties.itemDuration : 0,                //Number of seconds to cycle the item, 0 to disable cycling.
    
        includePadding: false,          //Set to false in order to remove padding.
        includeTitle: false,			//Set to true to render image caption.
    
        renditionWidth: 600,            //Set to 0 to skip rendition.
        renditionHeight: 205,           //Set to 0 to skip rendition.
      }
    };
    this.domElement.innerHTML = '<div id="bb-billboard" class="bb-listview"></div>';

    Bluebox.Billboard.Execute(true,_options);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    let itemLimitConfig: any = [];
    let itemDurationConfig: any = [];

    if (this.properties.isReqItemLimit) {
      itemLimitConfig = PropertyPaneSlider('itemLimit',{  
        label:"Maximum items",  
        min:1,  
        max:20,  
        value:5,  
        showValue:true,  
        step:1                
      });
    }

    if (this.properties.isReqItemDur) {
      itemDurationConfig = PropertyPaneSlider('itemDuration',{  
        label:"Time to cycle",  
        min:1,  
        max:20,  
        value:7,  
        showValue:true,  
        step:1                
      });
    }

    return {
      pages: [
        {
          header: {
            description: "Billboard Header"
          },
          groups: [
            {
              groupFields: [
                PropertyPaneToggle('isReqItemLimit', {
                  label: 'Limit Billboards',
                  checked: true,
                }),
                itemLimitConfig,
                PropertyPaneToggle('isReqItemDur', {
                  label: 'Cycle Billboards',
                  checked: true,
                }),
                itemDurationConfig
              ]
            }
          ]
        }
      ]
    };
  }
}
