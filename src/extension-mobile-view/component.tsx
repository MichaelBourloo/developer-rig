import * as React from 'react';
import { ExtensionFrame } from '../extension-frame';
import { MobileOrientation } from '../constants/mobile';
import { ViewStyles, RigExtension, FrameSize } from '../core/models/rig';
import { Position } from '../types/extension-coordinator';
const { ExtensionMode, ExtensionViewType } = window['extension-coordinator'];

const ViewBackgroundColor = '#322F37';
const AbsolutePosition = 'absolute';

export interface ExtensionMobileViewProps {
  id: string;
  orientation: string;
  extension: RigExtension;
  frameSize: FrameSize;
  position: Position
  role: string;
}
type Props = ExtensionMobileViewProps & React.HTMLAttributes<HTMLDivElement>;

export class ExtensionMobileView extends React.Component<Props> {
  public computeFrameStyles(): ViewStyles {
    let frameStyles: ViewStyles;

    if (this.props.orientation === MobileOrientation.Portrait) {
      const height = Math.floor(this.props.frameSize.height * 0.65);
      frameStyles = {
        width: `${this.props.frameSize.width}px`,
        height: `${height}px`,
        bottom: '0'
      }
    } else {
      const width = Math.floor(this.props.frameSize.height * 0.28);
      frameStyles = {
        width: `${width}px`,
        height: `${this.props.frameSize.width}px`,
        right: '0'
      }
    }

    frameStyles.position = AbsolutePosition;
    return frameStyles;
  }

  public computeViewStyles() {
    let viewStyles: ViewStyles;
    if (this.props.orientation === MobileOrientation.Portrait) {
      viewStyles = {
        width: this.props.frameSize.width + 'px',
        height: this.props.frameSize.height + 'px',
      }
    } else {
      viewStyles = {
        width: this.props.frameSize.height + 'px',
        height: this.props.frameSize.width + 'px',
      }
    }

    viewStyles.background = ViewBackgroundColor;
    return viewStyles;
  }
  public render() {
    return (
      <div
        className="view component-view"
        style={this.computeViewStyles()}>
          <div style={this.computeFrameStyles()}>
          <ExtensionFrame
            className="view"
            frameId={`frameid-${this.props.id}`}
            extension={this.props.extension}
            type={ExtensionViewType.Mobile}
            mode={ExtensionMode.Viewer}
          />
        </div>
      </div>
    );
  }
}
