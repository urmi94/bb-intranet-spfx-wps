import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

// import * as strings from 'WeatherAndClockWebPartStrings';
import * as moment from 'moment-timezone';

import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
require('Bluebox.Util');
require('Bluebox.Constants');
require('Bluebox.Loader');
require('Bluebox.WeatherAndClock');

declare var Bluebox:any;

export interface IWeatherAndClockWebPartProps {
  description: string;
}

export default class WeatherAndClockWebPart extends BaseClientSideWebPart<IWeatherAndClockWebPartProps> {

  public render(): void {
    SPComponentLoader.loadCss('https://bbxclientsdevstoragecdn.blob.core.windows.net/urmi-broadcast/bb-webparts/BlueboxWeatherAndClock/Core/webparts/weatherandclock/weatherandclock.css');
    
    this.domElement.innerHTML = `<div id="weatherandclock" class="bbWP-WeatherAndClock"></div>`;
    
    var _o = {
      HtmlId: "weatherandclock",
      ListTitle: "Weather And Clock",
      ListVersion: "2",
      ServiceKey: "TpUthCtfPGzlRwC+PtO8GuBuIqUG/tOigeuj4/awdRQ=",
      ServiceUrl: "https://bbx-clients-shared-svc.azurewebsites.net",
      Source: "modern",
      Moment: moment
    };
    Bluebox.WeatherAndClock.Execute(_o);   
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Weather and Clock"//strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Weather and Clock",//strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "Weather and Clock description"//strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
