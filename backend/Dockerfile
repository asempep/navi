# 1단계: Maven으로 빌드
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Maven wrapper + pom 복사
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 의존성만 다운로드 (캐시 활용)
RUN ./mvnw dependency:go-offline -B

# 소스 복사 후 빌드
COPY src src
RUN ./mvnw package -DskipTests -B

# 2단계: 실행용 이미지
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 빌드된 jar만 복사
COPY --from=build /app/target/*.jar app.jar

# Railway 등에서 PORT 바인딩
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
