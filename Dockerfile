# Railway용: 저장소 루트(09_NaviPage)에서 빌드. Root Directory 설정 없이 배포 가능.
# 1단계: Maven으로 빌드
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

RUN ./mvnw dependency:go-offline -B
COPY backend/src src
RUN ./mvnw package -DskipTests -B

# 2단계: 실행용 이미지
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
