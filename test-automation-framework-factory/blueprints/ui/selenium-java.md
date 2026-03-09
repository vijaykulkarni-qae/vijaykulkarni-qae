# Blueprint: Selenium + Java — UI/E2E Testing (Production Framework)

> **Tool**: Selenium WebDriver 4 | **Language**: Java 17+ | **Domain**: UI/E2E Testing
> **Build**: Maven 3.9+ | **Runner**: TestNG 7.9+ | **Reporting**: Allure 2.25+
> **Last Updated**: 2026-03-09

---

## 1. Overview

This blueprint produces a **production-grade** UI/E2E test automation framework based on a real-world framework architecture. It goes far beyond a basic Selenium setup — it includes 30+ utility classes, hybrid UI+API testing, ThreadLocal driver management for parallel execution, multi-environment configuration, structured logging with Loki/Grafana integration, and a CI pipeline with 5+ parallel jobs.

This is the most detailed blueprint in the factory because Selenium+Java frameworks require the most scaffolding — the framework IS the product, not just a thin wrapper around a tool.

### Target Use Cases

- Enterprise-scale regression suites (500+ tests)
- Cross-browser testing via Selenium Grid / Selenoid
- Hybrid UI + API testing (UI verification + API setup/teardown/validation)
- Data-driven testing with TestNG DataProvider
- Multi-environment execution (dev, staging, pre-prod, production)
- Team of 3+ SDETs contributing concurrently

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build tool | Maven | Industry standard for Java; excellent dependency management; profiles for environments |
| Test runner | TestNG | Parallel execution at method/class/suite level; DataProvider; listeners; XML suite files |
| Page pattern | Page Object Model with BasePage | Encapsulates locators + actions; BasePage provides shared waits, assertions, JS execution |
| Driver management | ThreadLocal via DriverManager | Thread-safe parallel execution; each thread gets its own driver instance |
| Wait strategy | WebDriverWait with custom conditions | No Thread.sleep(); explicit waits with fluent conditions; custom ExpectedConditions |
| Assertions | Custom AssertionHelper wrapping TestNG Assert | Soft assertions, screenshot on failure, step-level logging |
| API integration | ApiExecutor (RestAssured-based) | Hybrid UI+API: create test data via API, verify backend state, reduce UI flakiness |
| Config | .properties per environment | Simple, proven, Java-native; loaded via ConfigReader utility |
| Logging | SLF4J + Logback + JSON appender | Structured logs shipped to Loki/Grafana; trace IDs per test |
| Reporting | Allure with @Step annotations | Step-level detail, attachments, categories, environment info, trends |

---

## 2. Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| JDK | 17+ | LTS; required for modern Selenium and TestNG |
| Maven | 3.9+ | Build and dependency management |
| Selenium WebDriver | 4.17+ | W3C protocol, relative locators, BiDi support |
| TestNG | 7.9+ | Parallel execution, data providers, listeners |
| Allure | 2.25+ | Reporting framework |
| Docker (optional) | 24+ | For Selenoid / containerized execution |
| Git | 2.40+ | Version control |

### Key Dependencies (pom.xml)

```xml
<properties>
    <java.version>17</java.version>
    <selenium.version>4.17.0</selenium.version>
    <testng.version>7.9.0</testng.version>
    <allure.version>2.25.0</allure.version>
    <restassured.version>5.4.0</restassured.version>
    <slf4j.version>2.0.11</slf4j.version>
    <logback.version>1.4.14</logback.version>
    <webdrivermanager.version>5.6.3</webdrivermanager.version>
    <faker.version>2.0.2</faker.version>
    <jackson.version>2.16.1</jackson.version>
</properties>

<dependencies>
    <!-- Core -->
    <dependency><groupId>org.seleniumhq.selenium</groupId><artifactId>selenium-java</artifactId><version>${selenium.version}</version></dependency>
    <dependency><groupId>org.testng</groupId><artifactId>testng</artifactId><version>${testng.version}</version></dependency>
    <dependency><groupId>io.github.bonigarcia</groupId><artifactId>webdrivermanager</artifactId><version>${webdrivermanager.version}</version></dependency>

    <!-- API Testing -->
    <dependency><groupId>io.rest-assured</groupId><artifactId>rest-assured</artifactId><version>${restassured.version}</version></dependency>
    <dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>${jackson.version}</version></dependency>

    <!-- Reporting -->
    <dependency><groupId>io.qameta.allure</groupId><artifactId>allure-testng</artifactId><version>${allure.version}</version></dependency>

    <!-- Logging -->
    <dependency><groupId>org.slf4j</groupId><artifactId>slf4j-api</artifactId><version>${slf4j.version}</version></dependency>
    <dependency><groupId>ch.qos.logback</groupId><artifactId>logback-classic</artifactId><version>${logback.version}</version></dependency>
    <dependency><groupId>net.logstash.logback</groupId><artifactId>logstash-logback-encoder</artifactId><version>7.4</version></dependency>

    <!-- Data Generation -->
    <dependency><groupId>net.datafaker</groupId><artifactId>datafaker</artifactId><version>${faker.version}</version></dependency>

    <!-- Utilities -->
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><version>1.18.30</version><scope>provided</scope></dependency>
    <dependency><groupId>com.google.guava</groupId><artifactId>guava</artifactId><version>33.0.0-jre</version></dependency>
</dependencies>
```

---

## 3. Architecture

### Folder Structure

```
project-root/
├── pom.xml
├── README.md
│
├── src/
│   ├── main/
│   │   ├── java/com/company/automation/
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── ConfigReader.java              # Loads .properties by environment
│   │   │   │   ├── FrameworkConfig.java            # Typed config wrapper (baseUrl, browser, timeouts)
│   │   │   │   └── BrowserConfig.java              # Browser-specific capabilities
│   │   │   │
│   │   │   ├── driver/
│   │   │   │   ├── DriverManager.java              # ThreadLocal<WebDriver> — thread-safe driver lifecycle
│   │   │   │   ├── DriverFactory.java              # Creates local/remote drivers by browser type
│   │   │   │   └── BrowserType.java                # Enum: CHROME, FIREFOX, EDGE, SAFARI
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── BasePage.java                   # Abstract: waits, clicks, types, JS, scrolls, alerts
│   │   │   │   ├── LoginPage.java
│   │   │   │   ├── DashboardPage.java
│   │   │   │   ├── SettingsPage.java
│   │   │   │   ├── UserManagementPage.java
│   │   │   │   └── components/
│   │   │   │       ├── NavigationBar.java
│   │   │   │       ├── DataTable.java              # Generic table component with row/column access
│   │   │   │       ├── Modal.java
│   │   │   │       └── DropdownSelector.java
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── ApiExecutor.java                # RestAssured wrapper: GET/POST/PUT/DELETE + auth
│   │   │   │   ├── ApiResponse.java                # Typed response wrapper with body, status, headers
│   │   │   │   ├── AuthTokenManager.java           # Acquires, caches, refreshes auth tokens
│   │   │   │   └── endpoints/
│   │   │   │       ├── UsersEndpoint.java           # CRUD for /api/users
│   │   │   │       ├── AuthEndpoint.java            # Login, token refresh
│   │   │   │       └── OrdersEndpoint.java
│   │   │   │
│   │   │   ├── data/
│   │   │   │   ├── TestDataFactory.java            # Master factory: delegates to domain factories
│   │   │   │   ├── UserDataFactory.java            # Generates user data with Faker
│   │   │   │   ├── OrderDataFactory.java
│   │   │   │   ├── DataProviders.java              # TestNG @DataProvider methods
│   │   │   │   └── models/
│   │   │   │       ├── UserModel.java              # POJO: email, name, role, password
│   │   │   │       ├── OrderModel.java
│   │   │   │       └── LoginCredentials.java
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── WaitUtils.java                  # Fluent waits, polling, custom conditions
│   │   │   │   ├── AssertionHelper.java            # Soft asserts, screenshot-on-fail, allure step logging
│   │   │   │   ├── ScreenshotUtils.java            # Full-page and element screenshots
│   │   │   │   ├── DateUtils.java                  # Date formatting, parsing, relative dates
│   │   │   │   ├── FileUtils.java                  # Download handling, temp file management
│   │   │   │   ├── JsonUtils.java                  # Jackson serialize/deserialize helpers
│   │   │   │   ├── RandomDataGenerator.java        # Email, phone, address, UUID generators
│   │   │   │   ├── RetryAnalyzer.java              # TestNG IRetryAnalyzer implementation
│   │   │   │   ├── RetryTransformer.java           # Applies RetryAnalyzer to all tests via IAnnotationTransformer
│   │   │   │   ├── JavaScriptUtils.java            # Execute JS, scroll into view, highlight element
│   │   │   │   ├── StringUtils.java                # Truncate, sanitize, mask PII for logs
│   │   │   │   ├── WindowUtils.java                # Tab/window management, switch handles
│   │   │   │   ├── FrameUtils.java                 # iFrame switching helpers
│   │   │   │   ├── AlertUtils.java                 # Accept/dismiss/getText for browser alerts
│   │   │   │   ├── CookieUtils.java                # Get/set/delete cookies
│   │   │   │   ├── EnvironmentUtils.java           # Environment detection, feature flags
│   │   │   │   ├── BrowserConsoleLogger.java       # Captures browser console logs
│   │   │   │   ├── NetworkInterceptor.java         # CDP-based request interception (Selenium 4 BiDi)
│   │   │   │   └── AllureUtils.java                # Attach screenshots/logs/data to Allure report
│   │   │   │
│   │   │   └── listeners/
│   │   │       ├── TestListener.java               # ITestListener: screenshots on failure, logging
│   │   │       ├── SuiteListener.java              # ISuiteListener: setup/teardown at suite level
│   │   │       ├── AllureStepListener.java         # WebDriverEventListener → Allure @Step logging
│   │   │       └── RetryListener.java              # IAnnotationTransformer: applies retry to all tests
│   │   │
│   │   └── resources/
│   │       ├── config/
│   │       │   ├── local.properties                # baseUrl=http://localhost:3000
│   │       │   ├── dev.properties
│   │       │   ├── staging.properties
│   │       │   ├── preprod.properties
│   │       │   └── production.properties
│   │       ├── logback.xml                         # Console + JSON file appender
│   │       └── allure.properties
│   │
│   └── test/
│       ├── java/com/company/automation/tests/
│       │   ├── BaseTest.java                       # @BeforeMethod: driver init, @AfterMethod: driver quit
│       │   ├── auth/
│       │   │   ├── LoginTest.java
│       │   │   └── LogoutTest.java
│       │   ├── dashboard/
│       │   │   └── DashboardTest.java
│       │   ├── users/
│       │   │   ├── CreateUserTest.java
│       │   │   └── UserManagementTest.java
│       │   ├── orders/
│       │   │   └── OrderFlowTest.java
│       │   └── hybrid/
│       │       └── ApiUiHybridTest.java            # API setup → UI verify → API assert
│       │
│       └── resources/
│           ├── testng-suites/
│           │   ├── smoke-suite.xml
│           │   ├── regression-suite.xml
│           │   ├── parallel-suite.xml
│           │   └── env-specific/
│           │       ├── staging-suite.xml
│           │       └── production-suite.xml
│           └── testdata/
│               ├── users.json
│               └── orders.csv
│
├── .github/
│   └── workflows/
│       └── selenium-tests.yml
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── selenoid/
│       ├── browsers.json
│       └── docker-compose.selenoid.yml
│
├── logs/                                           # Gitignored
├── allure-results/                                 # Gitignored
├── allure-report/                                  # Gitignored
└── target/                                         # Gitignored
```

### Module Dependency Graph

```
BaseTest
├── DriverManager → DriverFactory → BrowserConfig → ConfigReader
├── BasePage → WaitUtils, JavaScriptUtils, ScreenshotUtils, AllureUtils
│   └── LoginPage, DashboardPage, etc.
├── ApiExecutor → AuthTokenManager → ConfigReader
│   └── UsersEndpoint, AuthEndpoint, etc.
├── TestDataFactory → UserDataFactory, OrderDataFactory → RandomDataGenerator
├── AssertionHelper → ScreenshotUtils, AllureUtils
└── TestListener → ScreenshotUtils, AllureUtils, DriverManager
```

---

## 4. Core Patterns

### 4.1 ThreadLocal DriverManager

The heart of parallel execution — each thread gets its own WebDriver instance.

```java
public class DriverManager {
    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();

    public static WebDriver getDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver == null) {
            throw new IllegalStateException("WebDriver not initialized for current thread");
        }
        return driver;
    }

    public static void setDriver(WebDriver driver) {
        driverThreadLocal.set(driver);
    }

    public static void quitDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver != null) {
            driver.quit();
            driverThreadLocal.remove();
        }
    }
}
```

### 4.2 DriverFactory

```java
public class DriverFactory {
    private final FrameworkConfig config;

    public DriverFactory(FrameworkConfig config) {
        this.config = config;
    }

    public WebDriver createDriver() {
        if (config.isRemoteExecution()) {
            return createRemoteDriver();
        }
        return createLocalDriver();
    }

    private WebDriver createLocalDriver() {
        return switch (config.getBrowserType()) {
            case CHROME -> {
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--disable-notifications", "--start-maximized");
                if (config.isHeadless()) options.addArguments("--headless=new");
                yield new ChromeDriver(options);
            }
            case FIREFOX -> {
                FirefoxOptions options = new FirefoxOptions();
                if (config.isHeadless()) options.addArguments("-headless");
                yield new FirefoxDriver(options);
            }
            case EDGE -> {
                EdgeOptions options = new EdgeOptions();
                if (config.isHeadless()) options.addArguments("--headless=new");
                yield new EdgeDriver(options);
            }
            default -> throw new IllegalArgumentException("Unsupported browser: " + config.getBrowserType());
        };
    }

    private WebDriver createRemoteDriver() {
        try {
            MutableCapabilities caps = BrowserConfig.getCapabilities(config.getBrowserType());
            caps.setCapability("selenoid:options", Map.of(
                "enableVNC", true,
                "enableVideo", true,
                "enableLog", true
            ));
            return new RemoteWebDriver(new URL(config.getGridUrl()), caps);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid Grid URL: " + config.getGridUrl(), e);
        }
    }
}
```

### 4.3 BasePage

```java
public abstract class BasePage {
    protected final WebDriver driver;
    protected final WebDriverWait wait;
    private static final Logger log = LoggerFactory.getLogger(BasePage.class);

    protected BasePage() {
        this.driver = DriverManager.getDriver();
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(
            FrameworkConfig.getInstance().getExplicitWaitTimeout()
        ));
    }

    @Step("Click element: {locator}")
    protected void click(By locator) {
        waitForClickable(locator).click();
    }

    @Step("Type '{text}' into element: {locator}")
    protected void type(By locator, String text) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    @Step("Get text from element: {locator}")
    protected String getText(By locator) {
        return waitForVisible(locator).getText().trim();
    }

    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected WebElement waitForClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    protected void waitForInvisible(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    protected boolean isElementPresent(By locator) {
        try {
            driver.findElement(locator);
            return true;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    @Step("Scroll to element: {locator}")
    protected void scrollToElement(By locator) {
        WebElement element = driver.findElement(locator);
        ((JavascriptExecutor) driver).executeScript(
            "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element
        );
    }

    @Step("Navigate to URL: {url}")
    protected void navigateTo(String url) {
        driver.get(url);
        log.info("Navigated to: {}", url);
    }

    protected void waitForPageLoad() {
        wait.until(d -> ((JavascriptExecutor) d)
            .executeScript("return document.readyState").equals("complete"));
    }

    protected void selectDropdownByText(By locator, String text) {
        new Select(waitForVisible(locator)).selectByVisibleText(text);
    }

    protected List<String> getDropdownOptions(By locator) {
        return new Select(waitForVisible(locator))
            .getOptions().stream()
            .map(WebElement::getText)
            .collect(Collectors.toList());
    }
}
```

### 4.4 Page Object Example

```java
public class LoginPage extends BasePage {
    private static final By EMAIL_INPUT = By.cssSelector("[data-testid='email-input']");
    private static final By PASSWORD_INPUT = By.cssSelector("[data-testid='password-input']");
    private static final By LOGIN_BUTTON = By.cssSelector("[data-testid='login-button']");
    private static final By ERROR_MESSAGE = By.cssSelector("[data-testid='login-error']");
    private static final By FORGOT_PASSWORD_LINK = By.linkText("Forgot Password?");

    @Step("Login with email: {email}")
    public DashboardPage login(String email, String password) {
        type(EMAIL_INPUT, email);
        type(PASSWORD_INPUT, password);
        click(LOGIN_BUTTON);
        return new DashboardPage();
    }

    @Step("Verify error message is: {expectedMessage}")
    public LoginPage verifyErrorMessage(String expectedMessage) {
        AssertionHelper.assertEquals(getText(ERROR_MESSAGE), expectedMessage, "Login error message");
        return this;
    }

    @Step("Verify login page is displayed")
    public LoginPage verifyPageLoaded() {
        waitForVisible(EMAIL_INPUT);
        waitForVisible(PASSWORD_INPUT);
        waitForVisible(LOGIN_BUTTON);
        return this;
    }
}
```

### 4.5 BaseTest

```java
public class BaseTest {
    protected static final Logger log = LoggerFactory.getLogger(BaseTest.class);
    protected FrameworkConfig config;

    @BeforeSuite
    public void suiteSetup() {
        config = FrameworkConfig.getInstance();
        log.info("Suite starting | Environment: {} | Browser: {}", config.getEnvironment(), config.getBrowserType());
    }

    @BeforeMethod
    @Parameters({"browser"})
    public void setUp(@Optional("") String browser) {
        if (!browser.isEmpty()) {
            config.setBrowserType(BrowserType.valueOf(browser.toUpperCase()));
        }
        WebDriver driver = new DriverFactory(config).createDriver();
        DriverManager.setDriver(driver);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(0)); // Explicit waits only
        log.info("Driver initialized | Thread: {} | Browser: {}", Thread.currentThread().getId(), config.getBrowserType());
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            ScreenshotUtils.captureAndAttachToAllure("failure-" + result.getName());
            log.error("Test FAILED: {} | Duration: {}ms", result.getName(), result.getEndMillis() - result.getStartMillis());
        }
        DriverManager.quitDriver();
    }
}
```

### 4.6 ApiExecutor for Hybrid Testing

```java
public class ApiExecutor {
    private final String baseUrl;
    private final AuthTokenManager tokenManager;
    private static final Logger log = LoggerFactory.getLogger(ApiExecutor.class);

    public ApiExecutor() {
        this.baseUrl = FrameworkConfig.getInstance().getApiBaseUrl();
        this.tokenManager = new AuthTokenManager();
    }

    @Step("API GET: {endpoint}")
    public ApiResponse get(String endpoint) {
        Response response = given()
            .baseUri(baseUrl)
            .header("Authorization", "Bearer " + tokenManager.getToken())
            .header("Content-Type", "application/json")
            .log().method().log().uri()
        .when()
            .get(endpoint)
        .then()
            .log().status()
            .extract().response();

        return new ApiResponse(response);
    }

    @Step("API POST: {endpoint}")
    public ApiResponse post(String endpoint, Object body) {
        Response response = given()
            .baseUri(baseUrl)
            .header("Authorization", "Bearer " + tokenManager.getToken())
            .header("Content-Type", "application/json")
            .body(JsonUtils.toJson(body))
            .log().method().log().uri().log().body()
        .when()
            .post(endpoint)
        .then()
            .log().status()
            .extract().response();

        return new ApiResponse(response);
    }

    @Step("API DELETE: {endpoint}")
    public ApiResponse delete(String endpoint) {
        Response response = given()
            .baseUri(baseUrl)
            .header("Authorization", "Bearer " + tokenManager.getToken())
        .when()
            .delete(endpoint)
        .then()
            .extract().response();

        return new ApiResponse(response);
    }
}
```

### 4.7 Hybrid Test Example

```java
public class ApiUiHybridTest extends BaseTest {
    private ApiExecutor api;
    private String testUserId;

    @BeforeMethod
    public void createTestData() {
        api = new ApiExecutor();
        UserModel user = UserDataFactory.createRandomUser();
        ApiResponse response = api.post("/api/users", user);
        testUserId = response.getBodyAs(Map.class).get("id").toString();
        log.info("Created test user via API: {}", testUserId);
    }

    @Test(description = "Verify user created via API appears in UI")
    @Severity(SeverityLevel.CRITICAL)
    public void verifyApiCreatedUserInUI() {
        LoginPage loginPage = new LoginPage();
        loginPage.navigateTo(config.getBaseUrl() + "/login");
        DashboardPage dashboard = loginPage.login(config.getAdminEmail(), config.getAdminPassword());
        UserManagementPage usersPage = dashboard.navigateToUserManagement();

        usersPage.searchUser(testUserId);
        AssertionHelper.assertTrue(usersPage.isUserDisplayed(testUserId), "User should be visible in UI");
    }

    @AfterMethod
    public void cleanupTestData() {
        if (testUserId != null) {
            api.delete("/api/users/" + testUserId);
            log.info("Cleaned up test user: {}", testUserId);
        }
    }
}
```

### 4.8 Custom Wait Utilities

```java
public class WaitUtils {
    private static final Logger log = LoggerFactory.getLogger(WaitUtils.class);

    public static <T> T waitFor(WebDriver driver, Function<WebDriver, T> condition,
                                 Duration timeout, String description) {
        log.debug("Waiting for: {} (timeout: {}s)", description, timeout.getSeconds());
        return new WebDriverWait(driver, timeout)
            .withMessage("Timed out waiting for: " + description)
            .pollingEvery(Duration.ofMillis(500))
            .ignoring(StaleElementReferenceException.class)
            .until(condition);
    }

    public static void waitForElementCount(WebDriver driver, By locator, int expectedCount, Duration timeout) {
        waitFor(driver,
            d -> d.findElements(locator).size() == expectedCount,
            timeout,
            String.format("element count of '%s' to be %d", locator, expectedCount));
    }

    public static void waitForUrlContains(WebDriver driver, String urlFragment, Duration timeout) {
        waitFor(driver, ExpectedConditions.urlContains(urlFragment), timeout,
            "URL to contain: " + urlFragment);
    }

    public static void waitForAttributeValue(WebDriver driver, By locator, String attribute,
                                              String value, Duration timeout) {
        waitFor(driver, ExpectedConditions.attributeToBe(locator, attribute, value), timeout,
            String.format("'%s' attribute of '%s' to be '%s'", attribute, locator, value));
    }

    public static void waitForTextInElement(WebDriver driver, By locator, String text, Duration timeout) {
        waitFor(driver, ExpectedConditions.textToBePresentInElementLocated(locator, text), timeout,
            String.format("text '%s' in element '%s'", text, locator));
    }
}
```

### 4.9 RetryAnalyzer

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int retryCount = 0;
    private static final int MAX_RETRY = Integer.parseInt(
        System.getProperty("retry.max", "2")
    );
    private static final Logger log = LoggerFactory.getLogger(RetryAnalyzer.class);

    @Override
    public boolean retry(ITestResult result) {
        if (retryCount < MAX_RETRY) {
            retryCount++;
            log.warn("Retrying test: {} | Attempt: {}/{}", result.getName(), retryCount, MAX_RETRY);
            return true;
        }
        return false;
    }
}

// Applied globally via IAnnotationTransformer
public class RetryTransformer implements IAnnotationTransformer {
    @Override
    public void transform(ITestAnnotation annotation, Class testClass,
                          Constructor testConstructor, Method testMethod) {
        annotation.setRetryAnalyzer(RetryAnalyzer.class);
    }
}
```

### 4.10 DataProvider Pattern

```java
public class DataProviders {

    @DataProvider(name = "loginCredentials", parallel = true)
    public Object[][] loginCredentials() {
        return new Object[][] {
            {"valid@example.com", "password123", true},
            {"invalid@example.com", "wrong", false},
            {"", "password123", false},
            {"valid@example.com", "", false},
        };
    }

    @DataProvider(name = "usersFromJson")
    public Object[][] usersFromJson() throws IOException {
        List<UserModel> users = JsonUtils.readList("testdata/users.json", UserModel.class);
        return users.stream()
            .map(u -> new Object[]{u})
            .toArray(Object[][]::new);
    }

    @DataProvider(name = "usersFromCsv")
    public Object[][] usersFromCsv() throws IOException {
        return CsvUtils.readCsv("testdata/users.csv");
    }
}
```

### 4.11 TestNG Listener — Screenshot on Failure + Logging

```java
public class TestListener implements ITestListener {
    private static final Logger log = LoggerFactory.getLogger(TestListener.class);

    @Override
    public void onTestStart(ITestResult result) {
        log.info("▶ STARTING: {} | Thread: {}", result.getName(), Thread.currentThread().getId());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        log.info("✔ PASSED: {} | Duration: {}ms", result.getName(),
            result.getEndMillis() - result.getStartMillis());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        log.error("✘ FAILED: {} | Error: {}", result.getName(), result.getThrowable().getMessage());
        try {
            ScreenshotUtils.captureAndAttachToAllure("FAIL-" + result.getName());
            BrowserConsoleLogger.captureAndAttach();
        } catch (Exception e) {
            log.error("Failed to capture failure artifacts", e);
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        log.warn("⊘ SKIPPED: {}", result.getName());
    }
}
```

---

## 5. Configuration

### Environment Properties

```properties
# src/main/resources/config/staging.properties
base.url=https://staging.example.com
api.base.url=https://staging-api.example.com
browser=chrome
headless=true
remote.execution=false
grid.url=http://localhost:4444/wd/hub
implicit.wait=0
explicit.wait=15
page.load.timeout=30
admin.email=admin@staging.example.com
admin.password=${ADMIN_PASSWORD}
test.user.email=testuser@staging.example.com
test.user.password=${TEST_USER_PASSWORD}
retry.max=2
screenshot.on.failure=true
video.recording=true
```

### ConfigReader

```java
public class ConfigReader {
    private static final Properties properties = new Properties();
    private static final Logger log = LoggerFactory.getLogger(ConfigReader.class);

    static {
        String env = System.getProperty("env", "local");
        String configFile = "config/" + env + ".properties";
        try (InputStream is = ConfigReader.class.getClassLoader().getResourceAsStream(configFile)) {
            if (is == null) throw new FileNotFoundException("Config not found: " + configFile);
            properties.load(is);
            resolveEnvVars();
            log.info("Loaded configuration for environment: {}", env);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config: " + configFile, e);
        }
    }

    public static String get(String key) {
        return properties.getProperty(key);
    }

    public static String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public static int getInt(String key, int defaultValue) {
        String value = properties.getProperty(key);
        return value != null ? Integer.parseInt(value) : defaultValue;
    }

    public static boolean getBoolean(String key, boolean defaultValue) {
        String value = properties.getProperty(key);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }

    private static void resolveEnvVars() {
        properties.forEach((key, value) -> {
            String val = value.toString();
            if (val.startsWith("${") && val.endsWith("}")) {
                String envVar = val.substring(2, val.length() - 1);
                String envValue = System.getenv(envVar);
                if (envValue != null) {
                    properties.setProperty(key.toString(), envValue);
                }
            }
        });
    }
}
```

### Maven Profiles

```xml
<profiles>
    <profile>
        <id>local</id>
        <activation><activeByDefault>true</activeByDefault></activation>
        <properties><env>local</env><suite.file>testng-suites/smoke-suite.xml</suite.file></properties>
    </profile>
    <profile>
        <id>staging</id>
        <properties><env>staging</env><suite.file>testng-suites/regression-suite.xml</suite.file></properties>
    </profile>
    <profile>
        <id>production</id>
        <properties><env>production</env><suite.file>testng-suites/smoke-suite.xml</suite.file></properties>
    </profile>
</profiles>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
            <configuration>
                <suiteXmlFiles><suiteXmlFile>${suite.file}</suiteXmlFile></suiteXmlFiles>
                <systemPropertyVariables>
                    <env>${env}</env>
                </systemPropertyVariables>
                <argLine>-Denv=${env}</argLine>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## 6. Test Data Management

### Factory Pattern

```java
public class UserDataFactory {
    private static final Faker faker = new Faker();

    public static UserModel createRandomUser() {
        return UserModel.builder()
            .email(faker.internet().emailAddress())
            .firstName(faker.name().firstName())
            .lastName(faker.name().lastName())
            .password("Test@" + faker.internet().password(8, 12, true, true))
            .role("user")
            .build();
    }

    public static UserModel createAdminUser() {
        return createRandomUser().toBuilder().role("admin").build();
    }

    public static List<UserModel> createUsers(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> createRandomUser())
            .collect(Collectors.toList());
    }
}
```

### Data-Driven Tests

```java
@Test(dataProvider = "loginCredentials", dataProviderClass = DataProviders.class)
public void testLoginWithMultipleCredentials(String email, String password, boolean expectSuccess) {
    LoginPage loginPage = new LoginPage();
    loginPage.navigateTo(config.getBaseUrl() + "/login");
    loginPage.login(email, password);

    if (expectSuccess) {
        AssertionHelper.assertUrlContains("/dashboard", "Should redirect to dashboard");
    } else {
        AssertionHelper.assertTrue(loginPage.isErrorDisplayed(), "Should show error message");
    }
}
```

### API-Based Setup & Teardown

```java
@BeforeMethod
public void createTestData() {
    api = new ApiExecutor();
    UserModel user = UserDataFactory.createRandomUser();
    testUserId = api.post("/api/users", user).getBodyAs(Map.class).get("id").toString();
}

@AfterMethod
public void cleanupTestData() {
    if (testUserId != null) api.delete("/api/users/" + testUserId);
}
```

---

## 7. Reporting

### Allure Configuration

```properties
# allure.properties
allure.results.directory=allure-results
allure.link.issue.pattern=https://jira.company.com/browse/{}
allure.link.tms.pattern=https://testrail.company.com/index.php?/cases/view/{}
```

### @Step Annotations

Every significant action in page objects and utilities is annotated with `@Step`:

```java
@Step("Login with email: {email}")
public DashboardPage login(String email, String password) { ... }

@Step("Verify dashboard header shows: {expectedText}")
public void verifyHeader(String expectedText) { ... }
```

### Screenshot Attachment

```java
public class ScreenshotUtils {
    @Attachment(value = "{name}", type = "image/png")
    public static byte[] captureAndAttachToAllure(String name) {
        return ((TakesScreenshot) DriverManager.getDriver()).getScreenshotAs(OutputType.BYTES);
    }
}
```

### Allure Report Generation

```bash
# Generate
mvn allure:report

# Serve locally
mvn allure:serve

# In CI
allure generate allure-results --clean -o allure-report
```

### Structured Logging (Loki/Grafana)

```xml
<!-- logback.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/test-automation.json</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/test-automation-%d{yyyy-MM-dd}.%i.json.gz</fileNamePattern>
            <maxFileSize>50MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"service":"test-automation","environment":"${env:-local}"}</customFields>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="JSON_FILE" />
    </root>
</configuration>
```

---

## 8. Parallel Execution

### TestNG Parallel Suite

```xml
<!-- testng-suites/parallel-suite.xml -->
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Parallel Regression" parallel="methods" thread-count="5" verbose="1">
    <listeners>
        <listener class-name="com.company.automation.listeners.TestListener"/>
        <listener class-name="com.company.automation.listeners.RetryTransformer"/>
        <listener class-name="io.qameta.allure.testng.AllureTestNg"/>
    </listeners>

    <test name="Chrome Tests">
        <parameter name="browser" value="chrome"/>
        <packages>
            <package name="com.company.automation.tests.*"/>
        </packages>
    </test>
</suite>
```

### Multi-Browser Parallel

```xml
<!-- testng-suites/regression-suite.xml -->
<suite name="Cross Browser Regression" parallel="tests" thread-count="3">
    <test name="Chrome">
        <parameter name="browser" value="chrome"/>
        <classes><class name="com.company.automation.tests.auth.LoginTest"/></classes>
    </test>
    <test name="Firefox">
        <parameter name="browser" value="firefox"/>
        <classes><class name="com.company.automation.tests.auth.LoginTest"/></classes>
    </test>
    <test name="Edge">
        <parameter name="browser" value="edge"/>
        <classes><class name="com.company.automation.tests.auth.LoginTest"/></classes>
    </test>
</suite>
```

### Thread Safety Rules

1. **WebDriver**: ThreadLocal — each thread has its own driver
2. **Page Objects**: Created fresh in each test (not shared)
3. **Test Data**: Each test generates its own data via factories
4. **Config**: Read-only after initialization — inherently thread-safe
5. **Logging**: SLF4J is thread-safe; thread ID included in log pattern

---

## 9. CI/CD Integration

### GitHub Actions Workflow (5+ Parallel Jobs)

```yaml
# .github/workflows/selenium-tests.yml
name: Selenium Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1-5'  # Weekday mornings

env:
  JAVA_VERSION: '17'
  MAVEN_OPTS: '-Xmx1024m'

jobs:
  smoke:
    name: Smoke Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Plocal -Dsuite.file=testng-suites/smoke-suite.xml -Dheadless=true
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: smoke-allure-results, path: allure-results }

  regression-chrome:
    name: Regression - Chrome
    needs: smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Pstaging -Dbrowser=chrome -Dheadless=true -Dparallel.threads=3
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: chrome-allure-results, path: allure-results }

  regression-firefox:
    name: Regression - Firefox
    needs: smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Pstaging -Dbrowser=firefox -Dheadless=true -Dparallel.threads=3
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: firefox-allure-results, path: allure-results }

  regression-edge:
    name: Regression - Edge
    needs: smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Pstaging -Dbrowser=edge -Dheadless=true -Dparallel.threads=3
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: edge-allure-results, path: allure-results }

  api-hybrid:
    name: API + UI Hybrid Tests
    needs: smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Pstaging -Dsuite.file=testng-suites/hybrid-suite.xml -Dheadless=true
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: hybrid-allure-results, path: allure-results }

  data-driven:
    name: Data-Driven Tests
    needs: smoke
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17, cache: maven }
      - run: mvn test -Pstaging -Dsuite.file=testng-suites/data-driven-suite.xml -Dheadless=true
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: datadriven-allure-results, path: allure-results }

  allure-report:
    name: Generate Allure Report
    needs: [regression-chrome, regression-firefox, regression-edge, api-hybrid, data-driven]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { pattern: '*-allure-results', merge-multiple: true, path: merged-allure-results }
      - name: Generate Allure Report
        uses: simple-elf/allure-report-action@v1.9
        with:
          allure_results: merged-allure-results
          allure_report: allure-report
          allure_history: allure-history
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: allure-report
```

---

## 10. Docker Setup

### Dockerfile

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn compile -q

FROM maven:3.9-eclipse-temurin-17

WORKDIR /app
COPY --from=builder /app /app
COPY --from=builder /root/.m2 /root/.m2

ENTRYPOINT ["mvn", "test"]
CMD ["-Pstaging", "-Dheadless=true"]
```

### Selenoid Setup

```json
// docker/selenoid/browsers.json
{
  "chrome": {
    "default": "120.0",
    "versions": {
      "120.0": {
        "image": "selenoid/vnc_chrome:120.0",
        "port": "4444",
        "path": "/"
      }
    }
  },
  "firefox": {
    "default": "121.0",
    "versions": {
      "121.0": {
        "image": "selenoid/vnc_firefox:121.0",
        "port": "4444",
        "path": "/wd/hub"
      }
    }
  }
}
```

```yaml
# docker/selenoid/docker-compose.selenoid.yml
version: '3.8'

services:
  selenoid:
    image: aerokube/selenoid:latest
    ports: ['4444:4444']
    volumes:
      - ./browsers.json:/etc/selenoid/browsers.json:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - ./video:/opt/selenoid/video
      - ./logs:/opt/selenoid/logs
    command: ["-conf", "/etc/selenoid/browsers.json", "-video-output-dir", "/opt/selenoid/video", "-log-output-dir", "/opt/selenoid/logs"]

  selenoid-ui:
    image: aerokube/selenoid-ui:latest
    ports: ['8080:8080']
    command: ["--selenoid-uri", "http://selenoid:4444"]
    depends_on: [selenoid]

  test-runner:
    build:
      context: ../..
      dockerfile: docker/Dockerfile
    environment:
      - GRID_URL=http://selenoid:4444/wd/hub
      - REMOTE_EXECUTION=true
    depends_on: [selenoid]
    volumes:
      - ../../allure-results:/app/allure-results
```

### Running

```bash
# Start Selenoid + run tests
docker compose -f docker/selenoid/docker-compose.selenoid.yml up --build --exit-code-from test-runner

# Run specific profile
docker compose -f docker/selenoid/docker-compose.selenoid.yml run test-runner mvn test -Pstaging -Dbrowser=chrome

# View Selenoid UI (VNC to see browser sessions)
open http://localhost:8080
```

---

## 11. Quality Checklist

### Structure

- [ ] Maven project compiles with `mvn compile`
- [ ] Folder structure matches architecture section exactly
- [ ] All 30+ utility classes present and functional
- [ ] No circular dependencies between packages
- [ ] Lombok annotations compiling correctly

### Core Framework

- [ ] `DriverManager` uses `ThreadLocal<WebDriver>` — verified thread-safe
- [ ] `DriverFactory` creates Chrome, Firefox, Edge (local + remote)
- [ ] `BasePage` has 10+ common actions with `@Step` annotations
- [ ] At least 5 page objects extending BasePage
- [ ] Component objects (DataTable, Modal, Navbar) reusable across pages
- [ ] `ApiExecutor` supports GET/POST/PUT/DELETE with auth
- [ ] `AuthTokenManager` acquires, caches, and refreshes tokens

### Configuration

- [ ] `.properties` files exist for local, dev, staging, preprod, production
- [ ] `ConfigReader` resolves `${ENV_VAR}` placeholders from system environment
- [ ] Maven profiles for each environment
- [ ] TestNG XML suites for smoke, regression, parallel, environment-specific

### Testing

- [ ] At least 8 test classes demonstrating different patterns
- [ ] `@DataProvider` examples for data-driven testing (JSON, CSV, inline)
- [ ] Hybrid API+UI test demonstrating `ApiExecutor` integration
- [ ] Tests use factory-generated data, not hardcoded values
- [ ] Tests are independent — no ordering dependencies

### Reliability

- [ ] `RetryAnalyzer` implemented and applied globally via `RetryTransformer`
- [ ] No `Thread.sleep()` anywhere in the codebase
- [ ] `WebDriverWait` used for all element interactions
- [ ] `TestListener` captures screenshot + console logs on failure

### Reporting & Logging

- [ ] Allure reporting with `@Step`, `@Severity`, `@Feature`, `@Story`
- [ ] Screenshots attached to Allure on failure
- [ ] Structured JSON logging via Logback + Logstash encoder
- [ ] Thread ID and environment included in all log lines
- [ ] Allure report generates with `mvn allure:report`

### Infrastructure

- [ ] GitHub Actions workflow with 5+ parallel jobs (smoke → regression per browser → hybrid → data-driven)
- [ ] Allure report merge step across all jobs
- [ ] Dockerfile with multi-stage build
- [ ] Selenoid `docker-compose.yml` for remote browser execution
- [ ] `browsers.json` for Selenoid browser configuration

### Parallel Execution

- [ ] TestNG `parallel="methods"` with `thread-count=5` in suite XML
- [ ] Multi-browser parallel suite (Chrome + Firefox + Edge simultaneously)
- [ ] ThreadLocal driver confirmed via concurrent test execution
- [ ] No shared mutable state between tests

---

**Blueprint Owner**: UI Automation Builder
**Consumers**: Quality Gate Agent (validation), Infrastructure Agent (CI/CD/Docker), Documentation Agent (README)
**Note**: This is the reference blueprint for the most complex framework type. Other blueprints derive patterns from this one.
