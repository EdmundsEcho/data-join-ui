import * as sel from '../workbench.selectors';

describe('Selectors', () => {
  describe('workbench selectors', () => {
    const state = {
      workbench: {
        tree: {
          height: 0, // Board
          children: [
            {
              height: 1, // Palette
              children: [
                {
                  height: 2, // Column
                  children: [
                    {
                      height: 3, // Group
                      children: [
                        {
                          height: 4, // Card
                          name: 'Card1',
                        },
                        {
                          height: 4, // Card
                          name: 'Card2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              height: 1, // Canvas
              children: [
                {
                  height: 2, // Column
                  children: [
                    {
                      height: 3, // Group
                      children: [
                        {
                          height: 4, // Card
                          name: 'Card3',
                        },
                        {
                          height: 4, // Card
                          name: 'Card4',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    describe('selectPaletteColumns', () => {
      it('should return all of the Palettes nodes', () => {
        const result = sel.selectPaletteGroup(state);

        expect(result.length).toEqual(1);
        expect(result[0].height).toEqual(3);
        expect(result[0].children.length).toEqual(2);
        expect(result[0].children[0].name).toEqual('Card1');
      });
    });
    describe('selectCanvasNode', () => {
      it('should return the canvas node', () => {
        const result = sel.selectCanvasNode(state);

        expect(result.height).toEqual(1);
        expect(result.children[0].height).toEqual(2);
        expect(result.children[0].children[0].children[0].name).toEqual(
          'Card3',
        );
      });
    });
  });
});
