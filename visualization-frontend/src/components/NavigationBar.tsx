import * as React from 'react';
import '../styles/NavigationBar.css';

const icons = require('../resources/icons/all.svg') as string;

type Props = {
  name: string
}

export class NavigationBar extends React.Component<Props, {}> {

  render() {
    return (
      <nav id="navigationBar">
        <button onClick={() => history.back()}>
          <svg viewBox="0 0 24 24" className="icon">
            <use xlinkHref={`${icons}#nav-back`}/>
          </svg>
					<span>Back</span>
        </button>
        <small>{this.props.name}</small>
        <div className="hidden"></div>
      </nav>
    )
  }
}
