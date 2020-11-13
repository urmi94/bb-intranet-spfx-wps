import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {  SPHttpClient, SPHttpClientResponse} from '@microsoft/sp-http'; 
import * as jQuery from 'jquery'; //"https://code.jquery.com/jquery-3.3.1.js",
import 'jqueryui';

import { SPComponentLoader } from '@microsoft/sp-loader';

export interface IFaQsWebPartProps {
  description: string;
}

export interface ISPList {
  value: ISPListItem[];
}

export interface ISPListItem {
  Id: string;
  QnAEnabled: string;
  FAQCategory: {
    Title: string;
  };
  Title: string;  
  QnAAnswer: string;
}

export default class FaQsWebPart extends BaseClientSideWebPart<IFaQsWebPartProps> {

  public constructor() {
    super();
    SPComponentLoader.loadCss('https://bbxclientsdevstoragecdn.blob.core.windows.net/urmi-broadcast/bb-scripts/Core/fonts/font-awesome/font-awesome.min.css');
		SPComponentLoader.loadCss('https://bbxclientsdevstoragecdn.blob.core.windows.net/urmi-broadcast/bb-webparts/BlueboxQnA/Core/webparts/qna/qna.css');
  }

  private _getFaqData(): Promise<ISPList> {
    
    let currentWebUrl = this.context.pageContext.web.absoluteUrl; 
    let requestUrl = currentWebUrl.concat("/_api/web/Lists/GetByTitle('FAQ')/items?$filter=QnAEnabled eq 'Yes'&$select=ID,QnAEnabled,FAQCategory/Title,Title,QnAAnswer&$expand=FAQCategory&$orderby= FAQCategory/Title asc");
  
    return this.context.spHttpClient.get(requestUrl, SPHttpClient.configurations.v1) 
      .then((response: SPHttpClientResponse) => {
        
        return response.json();
      });
  }

  private _generateAccordion(): void {
    var groupedList = {};
    this._getFaqData()
    .then((response) => {  
      var data = response.value;
      var groupedItem = {};
      var tempCategory = data[0].FAQCategory.Title;
      data.forEach(faq => {
        groupedItem = {
          Id: faq.Id,
          QnAEnabled: faq.QnAEnabled,
          Title: faq.Title,
          QnAAnswer: faq.QnAAnswer
        };
        if(tempCategory != faq.FAQCategory.Title)
          tempCategory = faq.FAQCategory.Title;
          
        if(groupedList[tempCategory] != undefined)       
            groupedList[tempCategory] = groupedList[tempCategory].concat([groupedItem]); 
          else
            groupedList[tempCategory] = [groupedItem];    
      }); 
      this._createAccordionHtml(groupedList); 
    });   
  }

  private _createAccordionHtml(groupedList): void {

    var html: string = '<ul id="accordionGroups" class="accordion categoryAccordion">';
    for(var category in groupedList) {

      html += '<li class="group-header">'
			+ '<a class="toggle-section toggle-group">'
			+ "<span class='group-title'>" + category + "&nbsp;(" + groupedList[category].length + ")</span>"
			+ "</a>"
			+ "<ul class='inner item-container innerAccordion'>";

      groupedList[category].forEach(faq => {
        html += '<li class="item-header">'+
                  '<a class="toggle-section toggle-item">' +
                    '<span class="item-title">' + faq.Title + '</span>' + 
                  '</a>' +
                  '<div class="inner item-content">' + faq.QnAAnswer + '</div>' +
                '</li>';
        
      });     
      html += '</ul></li>';
    }
    html += '</ul>';

    this.domElement.innerHTML = html;

    const accordionOptions: JQueryUI.AccordionOptions = {
      animate: true,
      collapsible: true,
      active: false,
      heightStyle: "content"  
    };

    jQuery('.categoryAccordion,.innerAccordion', this.domElement).accordion(accordionOptions);


    jQuery('#accordionGroups a').click(() => {
      $('a.toggle-section').removeClass('active-row');

      if($('.item-header > a').hasClass('ui-accordion-header-active')) {
        $('a.ui-accordion-header-active').addClass('active-row');
        $('a.ui-accordion-header-active').parent().parent().addClass('show-content');
      }
      if($('.group-header > a').hasClass('ui-accordion-header-active')) {
        $('.group-header > a.ui-accordion-header-active').next().addClass('show-content');
      }
    });
  }

  public render(): void {
    this._generateAccordion();  
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "FAQs Header"
          },
          groups: [
            {
              groupName: "FAQs",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "Title"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
