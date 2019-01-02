const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert  = require('chai').assert;
const expect  = require('chai').expect;

describe('Phase Google Chrome test suite', function() {

    const pathToFile = file => `localhost:8000/demos/${file}.html`;

    const driver = new Builder().forBrowser('chrome').build();

    before(function() {
        driver.manage().setTimeouts({implicit: 5000, pageLoad: 5000, script: 5000});
    })

    after(function() {
        return driver.quit();  // Close all browser tabs
    });


    it('should open basic demo and check the title', async function() {
        // Basic demo should load within 3 seconds
        await driver.manage().setTimeouts({pageLoad: 3000});
        await driver.get(pathToFile('basic'));

        const title = await driver.getTitle();
        expect(title, 'Title is correct').to.equal('Basic Demo - Phase');
    });

    it('should open basic demo and check that nodes exist', async function() {
        // Wait until network is rendered
        let svg = await driver.findElement(By.id('phase-network'));
        await driver.wait(until.elementIsVisible(svg), 100);

        // Get text elements (labels) in node elements
        let nodes = await svg.findElements(By.css('.node'));
        let nodePromises = nodes.map(function(node) {
            return node.getText();
        });
        Promise.all(nodePromises)
            .then(function(nodeNames) {
                expect(nodeNames, 'nodes exist').to.include.members(['Valjean', 'Gribier', 'Boulatruelle']);
            })
            .catch(function(rej) {
                console.info(rej);
            });
    });

    it('should open array grouping demo and check that group styles are applied', async function() {
        // Basic demo should load within 3 seconds
        await driver.manage().setTimeouts({pageLoad: 3000});
        await driver.get(pathToFile('array_grouping'));

        // Wait until network is rendered
        let svg = await driver.findElement(By.id('phase-network'));
        await driver.wait(until.elementIsVisible(svg), 100);

        // Apply morphs
        let applyMorphButton = await driver.findElement(By.css('#sidebar input'));
        applyMorphButton.click();

        // Check that "Myriel" node has correct styles
        let myrielNode = await svg.findElement(By.xpath('//*[name()="g" and @class="node"]/*[name()="text" and contains(text(), "Myriel")]/../*[name()="circle"]'));
        let myrielNodeFill = await myrielNode.getCssValue('fill');
        expect(myrielNodeFill, 'Myriel node is filled blue').to.equal('rgb(125, 171, 255)');
        let myrielNodeStroke = await myrielNode.getCssValue('stroke');
        expect(myrielNodeStroke, 'Myriel node is bordered purple').to.equal('rgb(174, 99, 212)');
    });
});
