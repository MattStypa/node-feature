jest.dontMock('roller');

describe('roller', function() {

    var _roller = require('roller');

    it('should accept numerical salts', function() {
        _roller.roll(Math.random());
    });

    it('should accept string salts', function() {
        _roller.roll(Math.random().toString());
    });

    it('should not accepts NaNs in rollInt', function() {
        expect(function() {
            _roller.rollInt('test');
        }).toThrow();
    });

    it('should roll so the results are in an open set', function() {
        expect(_roller.rollInt(0xFFFFFFFF)).toBeLessThan(100);
    });

    it('should always roll the same for the same salt', function() {
        var salt = Math.random();
        var control = _roller.roll(salt);

        for (var i = 0; i < 1000; i++) {
            expect(_roller.roll(salt)).toEqual(control);
        }
    });

    it('should roll so the results tend toward uniform distribution', function() {
        var hits = Array(100).fill(0);
        var uniform = false;
        var roll;
        var min;
        var max;
        var diff;

        for (var i = 0; i < 1000; i++) {
            for (var j = 0; j < 1000; j++) {
                roll = _roller.roll(Math.random());
                hits[Math.floor(roll)]++;
            }
            min = Math.min.apply(this, hits);
            max = Math.max.apply(this, hits);
            diff = (max - min) / min * 100;
            if (diff < 20) {
                uniform = true;
                break;
            }
        }

        expect(uniform).toEqual(true);
    });
});
