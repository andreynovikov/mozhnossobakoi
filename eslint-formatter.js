/**
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */
"use strict";

const chalk = require("chalk");
const table = require("text-table");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return (count === 1 ? word : `${word}s`);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results, context) {

    let output = "\n",
        errorCount = 0,
        warningCount = 0,
        summaryColor = "yellow",
        rootPath = context.cwd + '/';

    results.forEach(result => {
        const messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        errorCount += result.errorCount;
        warningCount += result.warningCount;

        const file = result.filePath.replace(rootPath, '');

        output += `${chalk.bold(file)}\n`;

        const msgs = table(messages.map(message => {
            let messageType;

            if (message.fatal || message.severity === 2) {
                messageType = chalk.red(message.ruleId || "error");
                summaryColor = "red";
            } else {
                messageType = chalk.yellow(message.ruleId || "warning");
            }

            return [
                "",
                message.line || 0,
                message.column || 0,
                messageType,
                message.message.replace(/([^ ])\.$/u, "$1")
            ];
        }), {
            align: ["", "r", "l"]
        });

        output += `${msgs.split("\n").map(el => el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`))).join("\n")}\n\n`;
    });

    const total = errorCount + warningCount;

    if (total > 0) {
        output += chalk[summaryColor].bold([
            total, pluralize(" problem", total),
            " (", errorCount, pluralize(" error", errorCount), ", ",
            warningCount, pluralize(" warning", warningCount), ")\n"
        ].join(""));
    }

    // Resets output color, for prevent change on top level
    return total > 0 ? chalk.reset(output) : "";
};
