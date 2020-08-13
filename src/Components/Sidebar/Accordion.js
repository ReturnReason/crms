import React from 'react';
import './Accordion.scss';

const subTitle = 'TEST'

const data = [
  {
    title: 'Dashboard',
    subTitle
  },
  {
    title: 'Resource',
    subTitle
  },
  {
    title: 'Visualization',
    subTitle
  },
  {
    title: 'Billing',
    subTitle
  },
  {
    title: 'Setting',
  }
]

class Accordion extends React.Component {
  render () {
    return (
      <div {...{ className: 'wrapper' }}>
        <ul {...{ className: 'accordion-list' }}>
          {data.map((data, key) => {
            return (
              <li {...{ className: 'accordion-list__item', key }}>
                <AccordionItem {...data} />
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

class AccordionItem extends React.Component {
  state = {
    opened: false
  }
  
  render () {
    const {
      props: {
        subTitle,
        title,
        dashBoard
      },
      state: {
        opened
      }
    } = this
    
    return (
      <div
        {...{
          className: `accordion-item, ${opened && 'accordion-item--opened'}`
        }}
      >
        <div 
            {...{ 
                className : 'accordion-item__line' ,
                onClick : () => { this.setState({ opened: !opened }) }
            }}
        >
          <h3 {...{ className: 'accordion-item__title' }}>
            {title}
          </h3>
          <span {...{ className: 'accordion-item__icon' }}/>
        </div>
          <div {...{ className: 'accordion-item__inner' }}>
            <div {...{ className: 'accordion-item__content' }}>
              <p {...{ className: 'accordion-item__subTitle' }}>
                {subTitle}
              </p>
            </div>
          </div>
      </div>
    )
  }
}

export default Accordion;