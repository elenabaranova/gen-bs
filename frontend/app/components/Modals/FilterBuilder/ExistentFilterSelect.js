import React, {Component} from 'react';
import Select from '../../shared/Select';
import 'react-select/dist/react-select.css';
import _ from 'lodash';

import {
    getItemLabelByNameAndType,
    getReadonlyReasonForSessionAndType
} from '../../../utils/stringUtils';
import {
    filterBuilderStartEdit,
    filterBuilderDeleteFilter
} from '../../../actions/filterBuilder';


export default class ExistentFilterSelect extends Component {

    onSelectChange(filters, filterId, fields) {
        this.props.dispatch(filterBuilderStartEdit(false, _.find(filters, {id: filterId}) || null, fields));
    }

    onDuplicateClick(filter, fields) {
        this.props.dispatch(filterBuilderStartEdit(true, filter, fields));
    }

    onResetFilterClick(filter, fields) {
        this.props.dispatch(filterBuilderStartEdit(false, filter, fields));
    }

    onDeleteFilterClick(filterId) {
        this.props.dispatch(filterBuilderDeleteFilter(filterId));
    }

    render() {

        const {auth, fields} = this.props;
        const selectedFilter = this.props.filterBuilder.editingFilter.filter;
        const {filters} = this.props.filtersList;
        const disabled = auth.isDemo;
        const title = (auth.isDemo) ? 'Login or register to work with filter' : 'Make a copy for editing';
        const isFilterEditable = (selectedFilter.type === 'user');

        const descriptionText = getReadonlyReasonForSessionAndType('filter', auth.isDemo, selectedFilter.type);

        const selectItems = filters.map( filter => {
            return {
                value: filter.id,
                label: getItemLabelByNameAndType(filter.name, filter.type)
            };
        });

        return (

            <div className='in copyview'>
                <div className='row grid-toolbar'>
                    <div className='col-sm-6'>
                        <label data-localize='views.setup.selector.label'>Available Filters</label>
                    </div>
                </div>
                { descriptionText &&
                <div className='alert alert-help'>
                        <span data-localize='views.setup.selector.description'>
                            {descriptionText}
                        </span>
                </div>
                }
                <div className='row grid-toolbar row-head-selector'>
                    <div className='col-sm-6'>
                        <Select
                            options={selectItems}
                            value={selectedFilter.id}
                            onChange={(val) => this.onSelectChange(filters, val.value, fields)}
                        />
                    </div>
                    <div className='col-sm-6'>
                        <div className='btn-group' data-localize='actions.duplicate.help' data-toggle='tooltip'
                             data-placement='bottom' data-container='body'>
                            <button type='button'
                                    className='btn btn-default in copyview'
                                    id='dblBtn'
                                    onClick={() => this.onDuplicateClick(selectedFilter, fields)}
                                    disabled={disabled}
                                    title={title}
                            >
                                <span data-localize='actions.duplicate.title' className='hidden-xs'>Duplicate</span>
                                <span className='visible-xs'><i className='md-i'>content_copy</i></span>
                            </button>
                            {
                                //<!--   Видимы когда в селекторе выбраны пользовательские вью, которые можно редактировать -->
                            }
                            { isFilterEditable &&
                                <button type='button' className='btn btn-default'
                                        onClick={() => this.onResetFilterClick(selectedFilter, fields)}
                                >
                                    <span data-localize='views.setup.reset.title' className='hidden-xs'>Reset Filter</span>
                                    <span className='visible-xs'><i className='md-i'>settings_backup_restore</i></span>
                                </button>
                            }
                            { isFilterEditable &&
                                <button type='button'
                                        className='btn btn-default'
                                        onClick={() => this.onDeleteFilterClick(selectedFilter.id)}>
                                    <span data-localize='views.setup.delete.title' className='hidden-xs'>Delete Filter</span>
                                    <span className='visible-xs'><i className='md-i'>close</i></span>
                                </button>
                            }
                        </div>                            
                    </div>
                </div>
            </div>

        );
    }
}
