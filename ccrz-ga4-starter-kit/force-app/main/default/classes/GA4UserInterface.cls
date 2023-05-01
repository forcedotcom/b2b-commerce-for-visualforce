global with sharing class GA4UserInterface extends ccrz.cc_hk_UserInterface.v004 {
    private static String NEW_LINE = '\n';
    private static String SCRIPT_TAG_OPEN = '<script>';
    private static String SCRIPT_TAG_CLOSE = '</script>';
    private static String GA4_ANALYTICS_STATIC_RESOURCE = 'GA4Analytics';
    private static String GA4_ANALYTICS_JS = 'ga4analytics.js';
    private String ga4Id;

    public GA4UserInterface() {
        String ga4IdConfigValue = ccrz.cc_CallContext.getConfigValue('analytics.ga4id', null);
        ga4Id = String.isNotBlank(ga4IdConfigValue) ?
                EncodingUtil.urlEncode(ga4IdConfigValue, 'UTF-8') : 'GA4ID_NOT_SET';
    }

    global virtual override Map<String,Object> headContent(Map<String,Object> inpData){
        Map<String,Object> headContent = super.headContent(inpData);
        String headContentString = (String)headContent.get(HEAD_CONTENT);

        String ga4Includes = NEW_LINE + '<!-- GA4 INCLUDES BEGIN -->'
            + NEW_LINE + getGoogleTagIncludeScript()
            + NEW_LINE + getGA4Overrides()
            + NEW_LINE + '<!-- GA4 INCLUDES END -->';

        headContent.put(HEAD_CONTENT, ga4Includes + headContentString);

        return headContent;
    }

    private String getGoogleTagIncludeScript() {
        return '<script async="true" src="https://www.googletagmanager.com/gtag/js?id=' + ga4Id + '"></script>';
    }

    private String getGA4Overrides() {
        return '<script type="text/javascript" src="' + resourcePath(GA4_ANALYTICS_STATIC_RESOURCE, GA4_ANALYTICS_JS) + '"></script>';
    }
}