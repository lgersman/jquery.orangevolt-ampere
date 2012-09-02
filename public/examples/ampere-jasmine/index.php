<?php
	$LESS[] = '/examples/' . basename( __DIR__) . '/jasmine-tests.less';
?>
<script type="text/javascript" src="/examples/<?php echo basename( __DIR__)?>/tests/ampere-tests.js"></script>
<script type="text/javascript">
    (function() {
      window.ov.ampere.defaults['ampere.baseurl']='/lib/ampere';	
        
      var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var trivialReporter = new jasmine.TrivialReporter();

      jasmineEnv.addReporter(trivialReporter);

      jasmineEnv.specFilter = function(spec) {
        return trivialReporter.specFilter(spec);
      };

      var currentWindowOnload = window.onload;

      window.onload = function() {
        if (currentWindowOnload) {
          currentWindowOnload();
        }
        execJasmine();
      };

      function execJasmine() {
        jasmineEnv.execute();
      }

    })();
</script>
