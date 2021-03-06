import _ from 'lodash';
import React, {PropTypes} from 'react';
import classNames from 'classnames';

import ComponentBase from '../shared/ComponentBase';

import VariantsTableComment from './VariantsTableComment';

import FieldUtils from '../../utils/fieldUtils.js';

import {Popover, OverlayTrigger} from 'react-bootstrap';


export default class VariantsTableRow extends ComponentBase {
    constructor(props) {
        super(props);
        this.state = {
            isHighlighted: false
        };
    }

    render() {
        const {
            dispatch,
            row,
            auth,
            rowIndex,
            variantsHeader,
            sortState,
            isSelected,
            ui,
            p
        } = this.props;
        const rowFields = row.fields;
        const mandatoryFields = row.mandatoryFields;
        const comments = row.comments;

        const pos = mandatoryFields['POS'];
        const alt = mandatoryFields['ALT'];
        const chrom = mandatoryFields['CHROM'];
        const ref = mandatoryFields['REF'];
        const searchKey = row.searchKey;

        return (
            <tr className={classNames({'highlighted': this.state.isHighlighted})}>
                <td className='btntd row_checkbox'>
                    <div>{rowIndex + 1}</div>
                </td>
                <td className='btntd row_checkbox'
                    key='row_checkbox'>
                    <div>
                        <label className='checkbox'>
                            <input type='checkbox'
                                   checked={isSelected}
                                   onChange={() => this.onRowSelectionChanged()}
                            />
                            <i/>
                        </label>
                        <span />
                    </div>
                </td>
                <td className='btntd'>
                    <div>
                    </div>
                </td>
                <VariantsTableComment
                    alt={alt}
                    pos={pos}
                    reference={ref}
                    chrom={chrom}
                    searchKey={searchKey}
                    rowIndex={rowIndex}
                    dispatch={dispatch}
                    auth={auth}
                    comments={comments}
                    tableElement={this.props.tableElement}
                    onPopupTriggered={(isHighlighted) => this.setHighlighted(isHighlighted)}
                    ui={ui}
                    p={p}
                />
                {_.map(rowFields, (value, index) =>
                    this.renderFieldValue(index, variantsHeader[index].fieldId, variantsHeader[index].sampleId, value, sortState)
                )}
            </tr>
        );
    }

    setHighlighted(isHighlighted) {
        this.setState({
            isHighlighted
        });
    }

    onRowSelectionChanged() {
        const {onSelected, rowIndex, isSelected} = this.props;
        onSelected(rowIndex, !isSelected);
    }

    renderFieldValue(index, fieldId, sampleId, value, sortState) {
        const {fields: {totalFieldsHashedArray: {hash}}} = this.props;
        const columnSortParams = _.find(sortState, {fieldId, sampleId});
        const sortedActiveClass = classNames({
            'active': columnSortParams
        });

        const field = hash[fieldId];
        const isChromosome = this.isChromosome(field);
        const isValueHyperlink = this.isHyperlink(field, value);
        const key = `${fieldId}-${sampleId}`;
        const ref = `overlayTrigger-${index}-${key}`;

        return (
            <td
                className={sortedActiveClass}
                key={key}
            >
                {value ?
                    (isValueHyperlink && !this.hasMultipleValues(value) ?
                        this.renderHyperLinkValue(value, field) :
                        this.renderPopupValue(ref, value, field, isValueHyperlink, isChromosome)) :
                    <div />
                }
            </td>
        );
    }


    renderHyperLinkValue(value, field) {
        const {hyperlinkTemplate} = field;
        const replacementValue = encodeURIComponent(value);
        const valueUrl = hyperlinkTemplate.replace(FieldUtils.getDefaultLinkIdentity(), replacementValue);
        return (
            <div>
                <a className='table-hyperlink' href={valueUrl} target='_blank'>{value}</a>
            </div>
        );
    }

    renderPopupValue(ref, value, field, isValuedHyperlink, isChromosome) {
        const {rowIndex} = this.props;
        const id = `${rowIndex}-${ref}`; // unique id, 'ref' is unique for row, add rowIndex for full-table unique
        const popover = (
            <Popover id={id}
                onClick={() => this.refs[ref].hide()}
            >
                {isValuedHyperlink ? this.renderHyperLinks(field.hyperlinkTemplate, value) :
                    isChromosome ? this.renderChromosome(value) : value}
            </Popover>
        );

        return (
            <OverlayTrigger
                trigger='click'
                rootClose={true}
                placement='left'
                overlay={popover}
                container={this.props.tableElement}
                ref={ref}
            >
                <div>
                    {isValuedHyperlink ? (
                        <div>
                            <a href='#'>{value}</a>
                        </div>
                    ) : (
                        <a className='btn-link-default editable editable-pre-wrapped editable-click editable-open'>
                            {isChromosome ? this.renderChromosome(value) : value}
                        </a>
                    )}
                </div>
            </OverlayTrigger>
        );
    }

    isChromosome(field) {
        return field.name === 'CHROM';
    }

    renderChromosome(value) {
        const chromosomeHash = {
            23: 'X',
            24: 'Y'
        };
        const chromosomeValue = chromosomeHash[value];
        return chromosomeValue ? `${chromosomeValue}(${value || ''})` : value || '';
    }

    hasMultipleValues(value) {
        return value.split(',').length > 1;
    }

    renderHyperLinks(hyperlinkTemplate, value) {
        return _.map(value.split(','), (item, index) => {
            if (item !== '.') {
                const replacementValue = encodeURIComponent(item);
                const valueUrl = hyperlinkTemplate.replace(FieldUtils.getDefaultLinkIdentity(), replacementValue);
                return (
                    <div key={index}>
                        <a href={valueUrl} target='_blank'>{item}</a>
                    </div>
                );
            } else {
                return item;
            }
        });
    }

    isHyperlink(field, value) {
        return field.isHyperlink
            && field.hyperlinkTemplate
            && value
            && value !== '.';
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.row !== nextProps.row
            || this.props.isSelected !== nextProps.isSelected
            || this.props.p !== nextProps.p
            || this.state !== nextState;
    }
}

VariantsTableRow.propTypes = {
    row: PropTypes.object.isRequired,
    rowIndex: PropTypes.number.isRequired,
    sortState: PropTypes.array.isRequired,
    variantsHeader: PropTypes.array,
    auth: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    fields: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    onSelected: PropTypes.func.isRequired,
    tableElement: PropTypes.instanceOf(React.Component).isRequired,
    p: PropTypes.shape({t: PropTypes.func.isRequired}).isRequired
};
