import { List } from 'immutable';

import PrismOptions from './options';

var KEY_SEPARATOR = '-';

class PrismDecorator {
    constructor(options) {
        this.options = PrismOptions(options || {});
        this.highlighted = {};
    }
    /**
     * Return list of decoration IDs per character
     *
     * @param {ContentBlock}
     * @return {List<String>}
     */
    getDecorations(block) {
        var tokens, token, tokenId, resultId, offset = 0, tokenCount = 0;
        var filter = this.options.get('filter');
        var getSyntax = this.options.get('getSyntax');
        var blockKey = block.getKey();
        var blockText = block.getText();
        var decorations = Array(blockText.length).fill(null);
        var Prism = this.options.get('prism');
        var highlighted = this.highlighted;

        highlighted[blockKey] = {};

        if (!filter(block)) {
            return List(decorations);
        }

        var syntax = getSyntax(block) || this.options.get('defaultSyntax');

        // Allow for no syntax highlighting
        if (syntax == null) {
            return List(decorations);
        }

        // Parse text using Prism
        var grammar = Prism.languages[syntax];
        tokens = Prism.tokenize(blockText, grammar);


        function processToken(decorations, token, offset) {
            if (typeof token === 'string') {
                return;
            }
            //First write this tokens full length
            tokenId = 'tok' + (tokenCount++);
            resultId = blockKey + '-' + tokenId;
            highlighted[blockKey][tokenId] = token;
            occupySlice(decorations, offset, offset + token.length, resultId);
            //Then recurse through the child tokens, overwriting the parent
            var childOffset = offset;
            for (var i = 0; i < token.content.length; i++) {
                var childToken = token.content[i];
                processToken(decorations, childToken, childOffset);
                childOffset += childToken.length;
            }
        }

        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            processToken(decorations, token, offset);
            offset += token.length;
        }

        return List(decorations);
    }
    /**
     * Return component to render a decoration
     *
     * @param {String}
     * @return {Function}
     */
    getComponentForKey(key) {
        return this.options.get('render');
    }
    /**
     * Return props to render a decoration
     *
     * @param {String}
     * @return {Object}
     */
    getPropsForKey(key) {
        var parts = key.split(KEY_SEPARATOR);
        var blockKey = parts[0];
        var tokId = parts[1];
        var token = this.highlighted[blockKey][tokId];

        return {
            type: token.type
        };
    }
}




function occupySlice(targetArr, start, end, componentKey) {
    for (var ii = start; ii < end; ii++) {
        targetArr[ii] = componentKey;
    }
}

export default PrismDecorator;