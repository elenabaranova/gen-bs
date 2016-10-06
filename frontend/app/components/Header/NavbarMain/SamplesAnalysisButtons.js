
import React, { Component } from 'react';
import Perf from 'react-addons-perf';

const ENABLE_PERFORMANCE_CONTROLS = false;

export default class SamplesAnalysisButtons extends Component {

    onStop() {
        Perf.stop();
        const measurements = Perf.getLastMeasurements();
        console.log('Overall: ');
        Perf.printInclusive(measurements);
        console.log('Without component mounting:');
        Perf.printExclusive(measurements);
        console.log('Wasted');
        Perf.printWasted(measurements);
    }

    render() {
        return (
            <div className='samples-analysis-wrapper'>
                <div>
                    <a
                        type='button'
                        href='#'
                        className='btn navbar-btn'
                        id='btnToggle'
                        data-target='#analysis'
                        data-toggle='modal'
                        onClick={() => this.props.openAnalysisModal()}
                    ><span className='hidden-xs' data-localize='query.title'>Analysis</span>
                    <span className='visible-xs'><i className='ag22 ag-flask'></i></span>
                    </a>
                    {ENABLE_PERFORMANCE_CONTROLS &&
                    <div>
                        <button onClick={() => Perf.start()}>B</button>
                        <button onClick={() => this.onStop()}>E</button>
                    </div>
                    }
                </div>
            </div>
        );
    }
}
